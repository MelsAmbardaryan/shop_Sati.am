document.addEventListener('DOMContentLoaded', () => {

    // Swiper Slider
    const swiper = new Swiper('.mySlider', {
        loop: true,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 800,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Nav active state


    // Horizontal Scroll Arrows
    const leftBtn = document.getElementById('scrollLeft');
    const rightBtn = document.getElementById('scrollRight');

    if (leftBtn && rightBtn) {
        leftBtn.addEventListener('click', () => {
            navInner.scrollBy({ left: -240, behavior: 'smooth' });
        });

        rightBtn.addEventListener('click', () => {
            navInner.scrollBy({ left: 240, behavior: 'smooth' });
        });

        // Arrows visibility
        function updateArrows() {
            leftBtn.style.opacity = navInner.scrollLeft > 30 ? '1' : '0.5';
            const maxScroll = navInner.scrollWidth - navInner.clientWidth;
            rightBtn.style.opacity = navInner.scrollLeft < maxScroll - 30 ? '1' : '0.5';
        }

        navInner.addEventListener('scroll', updateArrows);
        setTimeout(updateArrows, 500);
    }
});
const API_URL = 'http://localhost:3000/api/products';
let allProducts = [];
let cart = [];   // զամբյուղի զանգված

// Ապրանքները բեռնել
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:60px;">Ապրանքները բեռնվում են...</p>';

    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        renderProducts('all');
    } catch (err) {
        grid.innerHTML = '<p style="text-align:center; color:red;">Սխալ է տեղի ունեցել</p>';
    }
}

// Ապրանքները ցուցադրել
function renderProducts(category) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    const filtered = category === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="price">${product.price.toLocaleString('hy-AM')} AMD</p>
                
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="changeQuantity('${product._id}', -1)">−</button>
                    <span class="quantity" id="qty-${product._id}">1</span>
                    <button class="quantity-btn" onclick="changeQuantity('${product._id}', 1)">+</button>
                </div>

                <button class="add-to-cart" onclick="addToCart('${product._id}')">
                    <i class="fas fa-shopping-cart"></i> Ավելացնել զամբյուղ
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Քանակի փոփոխություն (ժամանակավոր)
function changeQuantity(id, change) {
    const qtyEl = document.getElementById(`qty-${id}`);
    let qty = parseInt(qtyEl.textContent);
    qty = Math.max(1, qty + change);
    qtyEl.textContent = qty;
}

// Ավելացնել զամբյուղում
function addToCart(id) {
    const product = allProducts.find(p => p._id === id);
    if (!product) return;

    // Ստուգում ենք արդեն կա՞ զամբյուղում
    const existing = cart.find(item => item._id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartBadge();
    alert(`${product.name} ավելացվեց զամբյուղում!`);
}

// Զամբյուղի badge-ը թարմացնել (վերևի cart-ում)
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = totalItems;
}

// Կատեգորիա ֆիլտր
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const category = e.target.getAttribute('data-category');
        renderProducts(category);
    }
});

// Էջը բեռնելիս
window.onload = () => {
    loadProducts('all');
    updateCartBadge();
};

// Զամբյուղի մոդալ բացել
function openCartModal() {
    document.getElementById('cartModal').style.display = 'flex';
    renderCartItems();
}

// Զամբյուղի մոդալ փակել
function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

// Զամբյուղի ապրանքները ցույց տալ մոդալում
function renderCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Զամբյուղը դատարկ է</p>';
        document.getElementById('cartTotal').textContent = '0 AMD';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="price">${item.price.toLocaleString('hy-AM')} AMD</div>
            </div>
            <div style="text-align:right;">
                <div style="margin-bottom:8px;">
                    <button onclick="changeCartQuantity(${index}, -1)">−</button>
                    <span style="margin:0 10px; font-weight:600;">${item.quantity}</span>
                    <button onclick="changeCartQuantity(${index}, 1)">+</button>
                </div>
                <button onclick="removeFromCart(${index})" style="color:#c62828; font-size:13px;">Ջնջել</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('cartTotal').textContent = total.toLocaleString('hy-AM') + ' AMD';
}

// Քանակի փոփոխություն զամբյուղում
function changeCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    renderCartItems();
}

// Ապրանք ջնջել զամբյուղից
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCartItems();
}

// Պատվիրել (ժամանակավոր)
function checkout() {
    if (cart.length === 0) {
        alert("Զամբյուղը դատարկ է!");
        return;
    }
    alert("Շնորհակալություն! Ձեր պատվերը ընդունված է։ (Սա ժամանակավոր է)");
    cart = [];
    closeCartModal();
    updateCartBadge();
}

// i18next կարգավորում
// ==================== i18next ԿԱՐԳԱՎՈՐՈՒՄ ====================

i18next
    .use(i18nextBrowserLanguageDetector)
    .use(i18nextHttpBackend)
    .init({
        lng: 'hy',
        fallbackLng: 'hy',
        debug: true,
        backend: {
            loadPath: '/locales/{{lng}}/translation.json'
        }
    }, function(err, t) {
        if (err) console.error('i18next error:', err);
        updateContent();
    });

// Լեզուն փոխել
function changeLanguage(lng) {
    i18next.changeLanguage(lng, () => {
        updateContent();
        localStorage.setItem('i18nextLng', lng);
    });
}

// Բովանդակությունը թարմացնել
function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.innerHTML = i18next.t(key);
        }
    });
}

// Էջը բեռնելիս
window.onload = () => {
    // Վերականգնում ենք նախկինում ընտրված լեզուն
    const savedLang = localStorage.getItem('i18nextLng') || 'hy';
    changeLanguage(savedLang);

    // ... քո մյուս կոդը (Swiper, loadProducts և այլն)
    // օրինակ՝ loadProducts('all');
};