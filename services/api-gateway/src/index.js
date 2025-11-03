const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const proxy = require('express-http-proxy');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:8081';
const MERCHANT_SERVICE_URL = process.env.MERCHANT_SERVICE_URL || 'http://merchant-service:8082';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8083';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:8084';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

// Routes - User Service
app.use('/api/users', proxy(USER_SERVICE_URL));

// Routes - Merchant Service
app.use('/api/merchants', proxy(MERCHANT_SERVICE_URL));

// Routes - Product Service
app.use('/api/products', proxy(PRODUCT_SERVICE_URL));

// Routes - Order Service
app.use('/api/orders', proxy(ORDER_SERVICE_URL));

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Microservices API Gateway',
    services: {
      users: '/api/users',
      merchants: '/api/merchants',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log(`User Service: ${USER_SERVICE_URL}`);
  console.log(`Merchant Service: ${MERCHANT_SERVICE_URL}`);
  console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log(`Order Service: ${ORDER_SERVICE_URL}`);
});
