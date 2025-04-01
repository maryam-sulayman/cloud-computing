const express = require('express');
const multer  = require('multer');
const fs  = require('fs');
const path = require('path');
const db = require('./db');

db.query('SELECT 1', (err, results) => {
    if (err) console.error('❌ DB connection failed:', err);
    else console.log('✅ DB connection test passed!');
});


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded images


app.get('/', (req, res) => {
    const success = req.query.success === 'true';

    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error loading products:', err);
            return res.status(500).send('Database error');
        }

        res.render('index', { success, products: results });
    });
});


app.get('/listings', (req, res) => {
    const sql = 'SELECT * FROM products';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error loading products:', err);
            return res.status(500).send('Database error');
        }

        res.render('listings', { products: results });
    });
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

    const imageUrl = `/uploads/${image.filename}`; // Later you can swap this for the S3 URL

    const sql = `
        INSERT INTO products (name, description, price, type, image_url)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [productName, description, price, type, imageUrl], (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).send('Database error');
        }

        res.redirect('/?success=true');
    });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
