const express = require('express');
const multer  = require('multer');
const fs  = require('fs');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Serve static files (optional if you add CSS or JS later)
app.use(express.static('public'));

// Display form with optional success message
app.get('/', (req, res) => {
    const success = req.query.success === 'true';
    res.render('index', { success });
});

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = './uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Handle form submission
app.post('/upload', upload.single('productImage'), (req, res) => {
    const { productName, description, price, type } = req.body;
    const image = req.file;

    console.log('New product uploaded:');
    console.log('Name:', productName);
    console.log('Type:', type);
    console.log('Description:', description);
    console.log('Price:', price);
    console.log('Image file:', image.originalname);

    // Redirect to show success message
    res.redirect('/?success=true');
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
