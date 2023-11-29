// server.js

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'raghava',
    password: 'Pqmz@1234567',
    database: 'iwms',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Route for user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store the user in the database
        // Note: In a production system, you should handle unique username constraints.
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user: ', err);
                res.status(500).send('Error registering user');
            } else {
                console.log('User registered successfully');
                res.status(200).send('User registered successfully');
            }
        });
    } catch (error) {
        console.error('Error hashing password: ', error);
        res.status(500).send('Error hashing password');
    }
});

// Route for user login
app.post('/dashboard', async (req, res) => {
    const { username, password } = req.body;

    // Check if the provided username exists
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error checking user credentials: ', err);
            res.status(500).send('Error checking user credentials');
        } else if (results.length > 0) {
            // Compare the provided password with the stored hashed password
            const match = await bcrypt.compare(password, results[0].password);

            if (match) {
                // Redirect to the dashboard and pass the username as a parameter
                // Additionally, pass the product data to the dashboard
                res.render('dashboard', { username, products: await getProductsFromDatabase() });
            } else {
                res.send('Login failed. Please check your credentials.');
            }
        } else {
            res.send('Login failed. Please check your credentials.');
        }
    });
});

// Route for user logout
app.get('/logout', (req, res) => {
    // Redirect to the login page
    res.redirect('/public/index.html');
});

// Route to render the products page
app.get('/products', (req, res) => {
    res.sendFile(__dirname + '/public/products.html');
});

// Route to render the customer page
app.get('/customer', (req, res) => {
    res.sendFile(__dirname + '/public/customer.html');
});

// Route to render the orders page
app.get('/orders', (req, res) => {
    res.sendFile(__dirname + '/public/orders.html');
});

// Route to place an order
app.post('/place-order', (req, res) => {
    const { productName, quantity } = req.body;

    // Insert the order into the database
    const sql = 'INSERT INTO orders (product_name, quantity) VALUES (?, ?)';
    db.query(sql, [productName, quantity], (err, result) => {
        if (err) {
            console.error('Error placing order in the database: ', err);
            res.status(500).send('Error placing order in the database');
        } else {
            console.log('Order placed in the database successfully');
            res.send('Order placed successfully');
        }
    });
});

// Route to get the order list from the database
app.get('/get-orders', async (req, res) => {
    const orders = await getOrdersFromDatabase();
    res.json(orders);
});

// Function to get orders from the database
async function getOrdersFromDatabase() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM orders';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error getting order list from the database: ', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Route to add a product
app.post('/add-product', (req, res) => {
    const { productName, price, quantity } = req.body;

    const product = {
        name: productName,
        price: parseFloat(price),
        quantity: parseInt(quantity),
    };

    // Insert the product into the database
    const sql = 'INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)';
    db.query(sql, [product.name, product.price, product.quantity], (err, result) => {
        if (err) {
            console.error('Error adding product to the database: ', err);
            res.status(500).send('Error adding product to the database');
        } else {
            console.log('Product added to the database successfully');
            res.send('Product added successfully');
        }
    });
});

// Route to delete a product by ID
app.delete('/delete-product/:product_id', (req, res) => {
    const productId = req.params.product_id;

    const sql = 'DELETE FROM products WHERE product_id = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product from the database: ', err);
            res.status(500).send('Error deleting product from the database');
        } else {
            console.log('Product deleted from the database successfully');
            res.send('Product deleted successfully');
        }
    });
});

// Route to get the product list from the database
app.get('/get-products', async (req, res) => {
    const products = await getProductsFromDatabase();
    res.json(products);
});

// Route to get product availability
app.get('/get-product-availability', async (req, res) => {
    try {
        const products = await getProductsFromDatabase();
        const availability = products.map((product) => ({
            product_id: product.product_id,
            name: product.name,
            availability: product.quantity > 0 ? 'In Stock' : 'Out of Stock',
        }));
        res.json(availability);
    } catch (error) {
        console.error('Error getting product availability: ', error);
        res.status(500).send('Error getting product availability');
    }
});

// Function to get products from the database
async function getProductsFromDatabase() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM products';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error getting product list from the database: ', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// ... existing code ...

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
