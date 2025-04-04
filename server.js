require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs  = require('fs');
const path = require('path');
const db = require('./db');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');


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

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  const s3 = new AWS.S3();
  
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const fileName = Date.now().toString() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, fileName);
      }
    })
  });
      


app.post('/upload', upload.single('productImage'), (req, res) => {
    const { productName, description, price, type } = req.body;
    const image = req.file;

    const imageUrl = req.file.location; // This is the S3 URL`;

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



app.listen(3000, '0.0.0.0',() => console.log('🚀 Server running on http://localhost:3000'));
