const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const redis = require('redis');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8083;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'mysql',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'microservices',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Redis Client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Service URLs
const MERCHANT_SERVICE_URL = process.env.MERCHANT_SERVICE_URL || 'http://merchant-service:8082';

// Initialize Database
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        merchant_id INT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        category VARCHAR(100),
        image_url VARCHAR(500),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('Products table created successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Helper function to get merchant info from Merchant Service
async function getMerchantInfo(merchantId) {
  try {
    const response = await axios.get(`${MERCHANT_SERVICE_URL}/${merchantId}`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch merchant ${merchantId}:`, error.message);
    return null;
  }
}

// Get all products
app.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [products] = await connection.query('SELECT * FROM products');
    connection.release();
    
    // Optionally enrich products with merchant info
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const merchant = await getMerchantInfo(product.merchant_id);
        return {
          ...product,
          merchant_info: merchant
        };
      })
    );
    
    res.json(enrichedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get from Redis cache
    const cachedProduct = await redisClient.get(`product:${id}`);
    if (cachedProduct) {
      return res.json(JSON.parse(cachedProduct));
    }

    const connection = await pool.getConnection();
    const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    connection.release();

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    
    // Enrich product with merchant info
    const merchant = await getMerchantInfo(product.merchant_id);
    const enrichedProduct = {
      ...product,
      merchant_info: merchant
    };

    // Cache the product for 30 minutes
    await redisClient.setEx(`product:${id}`, 1800, JSON.stringify(enrichedProduct));

    res.json(enrichedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/', async (req, res) => {
  try {
    const { name, merchant_id, description, price, stock, category, image_url, status } = req.body;

    if (!name || !merchant_id || !price) {
      return res.status(400).json({ error: 'Name, merchant_id and price are required' });
    }

    // Verify merchant exists
    const merchant = await getMerchantInfo(merchant_id);
    if (!merchant) {
      return res.status(400).json({ error: 'Invalid merchant_id' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO products (name, merchant_id, description, price, stock, category, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, merchant_id, description || null, price, stock || 0, category || null, image_url || null, status || 'active']
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      name,
      merchant_id,
      description,
      price,
      stock: stock || 0,
      category,
      image_url,
      status: status || 'active',
      merchant_info: merchant
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, merchant_id, description, price, stock, category, image_url, status } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE products SET name = ?, merchant_id = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ?, status = ? WHERE id = ?',
      [name, merchant_id, description || null, price, stock || 0, category || null, image_url || null, status || 'active', id]
    );
    connection.release();

    // Invalidate cache
    await redisClient.del(`product:${id}`);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM products WHERE id = ?', [id]);
    connection.release();

    // Invalidate cache
    await redisClient.del(`product:${id}`);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product stock
app.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, id]
    );
    connection.release();

    // Invalidate cache
    await redisClient.del(`product:${id}`);

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health/status', (req, res) => {
  res.json({ status: 'Product Service is running' });
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Product Service listening on port ${PORT}`);
  console.log(`Merchant Service URL: ${MERCHANT_SERVICE_URL}`);
});
