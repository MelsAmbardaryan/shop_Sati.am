const API_URL = 'http://localhost:3000/api/products';

// Բեռնել և ցուցադրել ապրանքները
async function loadProducts() {
    try {
        const res = await fetch(API_URL);
        const products = await res.json();
        
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#666;">Դեռ ապրանքներ չկան</td></tr>`;
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
          row.innerHTML = `
    <td><img src="${product.image}" class="product-image" alt="${product.name}"></td>
    <td><strong>${product.name}</strong></td>
    <td>${product.price ? product.price.toLocaleString('hy-AM') + ' AMD' : '—'}</td>
    <td>${product.discount != null ? Number(product.discount) + '%' : '0%'}</td>
    <td>${product.stock != null ? Number(product.stock) : '0'}</td>
    <td>${product.category || '—'}</td>
    <td>
        <button class="btn btn-edit" onclick="editProduct('${product._id}')">Խմբագրել</button>
        <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Ջնջել</button>
    </td>
`;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Սխալ ապրանքները բեռնելիս:', err);
    }
}

// Ապրանք ավելացնել
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value.trim());
    formData.append('price', document.getElementById('price').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('discount', document.getElementById('discount').value || 0);
    formData.append('stock', document.getElementById('stock').value || 0);
    formData.append('featured', document.getElementById('featured').checked);
    formData.append('image', document.getElementById('image').files[0]);

    const messageEl = document.getElementById('message');

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            messageEl.innerHTML = `<span class="success">✅ Ապրանքը հաջողությամբ ավելացվեց!</span>`;
            document.getElementById('productForm').reset();
            loadProducts();   // աղյուսակը թարմացնել
        } else {
            const errorText = await res.text();
            messageEl.innerHTML = `<span style="color:red;">❌ ${errorText || 'Սխալ է տեղի ունեցել'}</span>`;
        }
    } catch (err) {
        messageEl.innerHTML = `<span style="color:red;">❌ Սերվերի հետ կապի սխալ</span>`;
        console.error(err);
    }
});

// Ապրանք ջնջել
async function deleteProduct(id) {
    if (!confirm('Վստա՞հ եք, որ ուզում եք ջնջել այս ապրանքը?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadProducts();
    } catch (err) {
        alert('Ջնջման ժամանակ սխալ տեղի ունեցավ');
    }
}

// Խմբագրել (ժամանակավոր)
function editProduct(id) {
    alert(`Խմբագրումը դեռ չի իրականացվել լրիվ։\n\nԱպրանքի ID: ${id}\n\nՀաջորդ թարմացումում կավելացնենք խմբագրման պատուհան։`);
}

// Էջը բեռնելիս ապրանքները ցույց տալ
window.onload = loadProducts;