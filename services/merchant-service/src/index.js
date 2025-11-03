const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8082;

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

// Initialize Database
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id INT,
        description TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        address VARCHAR(500),
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('Merchants table created successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Get all merchants
app.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [merchants] = await connection.query('SELECT * FROM merchants');
    connection.release();
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get merchant by ID
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get from Redis cache
    const cachedMerchant = await redisClient.get(`merchant:${id}`);
    if (cachedMerchant) {
      return res.json(JSON.parse(cachedMerchant));
    }

    const connection = await pool.getConnection();
    const [merchants] = await connection.query('SELECT * FROM merchants WHERE id = ?', [id]);
    connection.release();

    if (merchants.length === 0) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Cache the merchant for 1 hour
    await redisClient.setEx(`merchant:${id}`, 3600, JSON.stringify(merchants[0]));

    res.json(merchants[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create merchant
app.post('/', async (req, res) => {
  try {
    const { name, owner_id, description, phone, email, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO merchants (name, owner_id, description, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, owner_id || null, description || null, phone || null, email || null, address || null, status || 'active']
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      name,
      owner_id,
      description,
      phone,
      email,
      address,
      status: status || 'active'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update merchant
app.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, owner_id, description, phone, email, address, status } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE merchants SET name = ?, owner_id = ?, description = ?, phone = ?, email = ?, address = ?, status = ? WHERE id = ?',
      [name, owner_id || null, description || null, phone || null, email || null, address || null, status || 'active', id]
    );
    connection.release();

    // Invalidate cache
    await redisClient.del(`merchant:${id}`);

    res.json({ message: 'Merchant updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete merchant
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM merchants WHERE id = ?', [id]);
    connection.release();

    // Invalidate cache
    await redisClient.del(`merchant:${id}`);

    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health/status', (req, res) => {
  res.json({ status: 'Merchant Service is running' });
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Merchant Service listening on port ${PORT}`);
});
