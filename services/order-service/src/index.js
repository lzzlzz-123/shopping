const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const redis = require('redis');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8084;

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
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:8081';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8083';

// Initialize Database
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Order tables created successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Helper function to get user info from User Service
async function getUserInfo(userId) {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/${userId}`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error.message);
    return null;
  }
}

// Helper function to get product info from Product Service
async function getProductInfo(productId) {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/${productId}`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error.message);
    return null;
  }
}

// Get all orders
app.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [orders] = await connection.query('SELECT * FROM orders');
    connection.release();
    
    // Enrich orders with user info
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await getUserInfo(order.user_id);
        return {
          ...order,
          user_info: user
        };
      })
    );
    
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID with order items
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    connection.release();

    // Enrich items with product info
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await getProductInfo(item.product_id);
        return {
          ...item,
          product_info: product
        };
      })
    );

    // Enrich order with user info
    const user = await getUserInfo(order.user_id);

    const enrichedOrder = {
      ...order,
      user_info: user,
      items: enrichedItems
    };

    res.json(enrichedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/', async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'user_id and items are required' });
    }

    // Verify user exists
    const user = await getUserInfo(user_id);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user_id' });
    }

    // Verify products exist and calculate total
    let totalPrice = 0;
    for (const item of items) {
      const product = await getProductInfo(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Invalid product_id: ${item.product_id}` });
      }
      totalPrice += product.price * item.quantity;
    }

    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
        [user_id, totalPrice, 'pending']
      );

      const orderId = orderResult.insertId;

      // Add order items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price || 0]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        id: orderId,
        user_id,
        total_price: totalPrice,
        status: 'pending',
        items,
        user_info: user
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    connection.release();

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    
    // Delete order items first (cascade in DB)
    await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    
    // Delete order
    await connection.query('DELETE FROM orders WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health/status', (req, res) => {
  res.json({ status: 'Order Service is running' });
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`);
  console.log(`User Service URL: ${USER_SERVICE_URL}`);
  console.log(`Product Service URL: ${PRODUCT_SERVICE_URL}`);
});
