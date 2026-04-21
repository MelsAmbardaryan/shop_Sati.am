const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ստատիկ ֆայլերի սպասարկում (ամենակարևորը)
app.use(express.static(path.join(__dirname, '../')));        // index.html, admin.html, style.css, script.js և այլն
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/products', require('./routes/products'));

// MongoDB կապ
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB-ն հաջողությամբ միացված է'))
    .catch(err => console.error('❌ MongoDB կապի սխալ:', err.message));

// Հիմնական էջ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Admin պանել
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Եթե որևէ այլ էջ բացեն
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Սերվերը աշխատում է http://localhost:${PORT}`);
});
