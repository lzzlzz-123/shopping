-- SQL Import Script for Microservices E-commerce System
-- This script creates all necessary tables and imports sample data

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Merchants table
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
);

-- Create Products table
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
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (name, email, phone, address) VALUES
('John Doe', 'john.doe@example.com', '1234567890', '123 Main St, New York'),
('Jane Smith', 'jane.smith@example.com', '0987654321', '456 Oak Ave, Los Angeles'),
('Bob Johnson', 'bob.johnson@example.com', '5555555555', '789 Pine Rd, Chicago'),
('Alice Williams', 'alice.williams@example.com', '4444444444', '321 Elm St, Houston'),
('Charlie Brown', 'charlie.brown@example.com', '3333333333', '654 Maple Ln, Phoenix');

-- Insert sample merchants
INSERT INTO merchants (name, owner_id, description, phone, email, address, status) VALUES
('TechGear Store', 1, 'Premium electronics and gadgets', '1111111111', 'info@techgear.com', '123 Tech Blvd, San Francisco', 'active'),
('Fashion Plus', 2, 'Trendy clothing and accessories', '2222222222', 'contact@fashionplus.com', '456 Style Ave, New York', 'active'),
('Home Essentials', 3, 'Home furniture and decor', '3333333333', 'support@homeessentials.com', '789 Living St, Los Angeles', 'active'),
('Sports World', 4, 'Sports equipment and outdoor gear', '4444444444', 'hello@sportsworld.com', '321 Athletic Dr, Chicago', 'active'),
('Beauty Hub', 5, 'Cosmetics and beauty products', '5555555555', 'care@beautyhub.com', '654 Glamour Ln, Houston', 'active');

-- Insert sample products
INSERT INTO products (name, merchant_id, description, price, stock, category, image_url, status) VALUES
('Wireless Headphones', 1, 'High quality wireless headphones with noise cancellation', 99.99, 50, 'Electronics', 'https://via.placeholder.com/300?text=Headphones', 'active'),
('USB-C Charger', 1, 'Fast charging USB-C charger compatible with all devices', 29.99, 100, 'Electronics', 'https://via.placeholder.com/300?text=Charger', 'active'),
('Laptop Stand', 1, 'Ergonomic adjustable laptop stand', 49.99, 30, 'Electronics', 'https://via.placeholder.com/300?text=Laptop+Stand', 'active'),
('Designer T-Shirt', 2, 'Premium cotton designer t-shirt', 39.99, 75, 'Clothing', 'https://via.placeholder.com/300?text=T-Shirt', 'active'),
('Blue Jeans', 2, 'Classic blue denim jeans', 59.99, 60, 'Clothing', 'https://via.placeholder.com/300?text=Jeans', 'active'),
('Leather Belt', 2, 'Genuine leather belt with metal buckle', 44.99, 40, 'Accessories', 'https://via.placeholder.com/300?text=Belt', 'active'),
('Dining Table', 3, 'Modern wooden dining table', 299.99, 15, 'Furniture', 'https://via.placeholder.com/300?text=Dining+Table', 'active'),
('Office Chair', 3, 'Comfortable ergonomic office chair', 199.99, 25, 'Furniture', 'https://via.placeholder.com/300?text=Office+Chair', 'active'),
('Wall Clock', 3, 'Decorative wall clock', 34.99, 50, 'Decor', 'https://via.placeholder.com/300?text=Wall+Clock', 'active'),
('Running Shoes', 4, 'Professional grade running shoes', 129.99, 45, 'Sports', 'https://via.placeholder.com/300?text=Running+Shoes', 'active'),
('Yoga Mat', 4, 'Non-slip yoga mat with carrying strap', 24.99, 80, 'Sports', 'https://via.placeholder.com/300?text=Yoga+Mat', 'active'),
('Dumbbell Set', 4, 'Adjustable dumbbell set 5-50 lbs', 199.99, 20, 'Sports', 'https://via.placeholder.com/300?text=Dumbbells', 'active'),
('Lip Balm', 5, 'Moisturizing lip balm SPF 15', 9.99, 200, 'Beauty', 'https://via.placeholder.com/300?text=Lip+Balm', 'active'),
('Foundation', 5, 'Liquid foundation with full coverage', 34.99, 60, 'Beauty', 'https://via.placeholder.com/300?text=Foundation', 'active'),
('Face Mask', 5, 'Hydrating face mask sheet pack', 19.99, 100, 'Beauty', 'https://via.placeholder.com/300?text=Face+Mask', 'active');

-- Insert sample orders
INSERT INTO orders (user_id, total_price, status) VALUES
(1, 229.97, 'confirmed'),
(2, 99.99, 'pending'),
(3, 539.98, 'shipped'),
(4, 154.98, 'delivered'),
(5, 89.98, 'pending');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 99.99),
(1, 3, 1, 49.99),
(2, 2, 1, 29.99),
(2, 9, 1, 34.99),
(2, 11, 1, 24.99),
(3, 4, 1, 39.99),
(3, 5, 2, 59.99),
(3, 10, 2, 129.99),
(4, 6, 1, 44.99),
(4, 14, 1, 34.99),
(4, 13, 2, 9.99),
(5, 13, 3, 9.99),
(5, 12, 1, 199.99);

-- Add indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
