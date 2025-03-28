const express = require('express');
const multer  = require('multer');
const fs  = require('fs');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Load existing products
function loadProducts() {
    if (fs.existsSync(PRODUCTS_FILE)) {
        return JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    }
    return [];
}

// Save products
function saveProducts(products) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

app.get('/', (req, res) => {
    const success = req.query.success === 'true';
    const products = loadProducts();
    res.render('index', { success, products });
});

app.get('/listings', (req, res) => {
    const products = loadProducts();
    res.render('listings', { products });
  });
  

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('productImage'), (req, res) => {
    const { productName, description, price, type } = req.body;
    const image = req.file;

    const newProduct = {
        productName,
        description,
        price,
        type,
        imageUrl: `/uploads/${image.filename}`
    };

    const products = loadProducts();
    products.push(newProduct);
    saveProducts(products);

    res.redirect('/?success=true');
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
