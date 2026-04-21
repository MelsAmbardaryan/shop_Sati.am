const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

// Multer կարգավորում՝ նկարների վերբեռնման համար
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // առավելագույնը 5 ՄԲ
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Միայն JPG, PNG և WEBP նկարներ են թույլատրվում!'));
    }
});

// === API Routes ===

// Բոլոր ապրանքները ստանալ
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Մեկ ապրանք ստանալ ID-ով
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Ապրանքը չի գտնվել' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Ապրանք ավելացնել (նկարով)
// Ապրանք ավելացնել
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, discount, stock, featured } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Նկարը պարտադիր է' });
        }

        const product = new Product({
            name,
            price: Number(price),
            category,
            description,
            discount: Number(discount) || 0,
            stock: Number(stock) || 0,
            featured: featured === 'true' || featured === true,
            image: `/uploads/${req.file.filename}`
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}); 

// Ապրանք խմբագրել
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { 
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category,
            description: req.body.description
        };
        
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Ապրանքը չի գտնվել' });
        }
        
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ապրանք ջնջել (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Ապրանքը չի գտնվել' });
        }
        
        res.json({ message: 'Ապրանքը հաջողությամբ ջնջվեց' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;