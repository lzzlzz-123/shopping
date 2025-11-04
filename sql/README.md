# SQL Import Script - Microservices E-commerce System

## Overview

This directory contains SQL scripts for initializing the database for the microservices e-commerce system.

## Files

- `init-database.sql`: Main SQL script that creates all tables and imports sample data

## Database Schema

The script creates the following tables:

### 1. Users Table
- Stores user information
- Fields: id, name, email, phone, address, created_at, updated_at
- Email field is unique

### 2. Merchants Table
- Stores merchant/seller information
- Fields: id, name, owner_id, description, phone, email, address, status, created_at, updated_at
- Status: 'active', 'inactive', or 'suspended'

### 3. Products Table
- Stores product information
- Fields: id, name, merchant_id, description, price, stock, category, image_url, status, created_at, updated_at
- Status: 'active' or 'inactive'

### 4. Orders Table
- Stores order header information
- Fields: id, user_id, total_price, status, created_at, updated_at
- Status: 'pending', 'confirmed', 'shipped', 'delivered', or 'cancelled'

### 5. Order Items Table
- Stores individual items in each order
- Fields: id, order_id, product_id, quantity, price, created_at
- Foreign key relationship with orders table

## Sample Data

The script includes sample data for:
- 5 Users
- 5 Merchants
- 15 Products across different categories (Electronics, Clothing, Furniture, Sports, Beauty)
- 5 Orders with multiple order items
- Total of 13 order items distributed across orders

## Usage

### Docker Compose Method

If using Docker Compose, the database is automatically initialized through the MySQL service startup scripts. However, you can manually import the data:

```bash
# Access MySQL container
docker exec -it microservices-mysql-1 mysql -u root -p microservices < sql/init-database.sql
```

### Direct MySQL Connection

```bash
# For local MySQL installation
mysql -u root -p microservices < sql/init-database.sql

# Or with specific host and port
mysql -h localhost -P 3306 -u root -p microservices < sql/init-database.sql
```

### Using Shell Script

```bash
# Make the script executable
chmod +x sql/import-database.sh

# Run the import script
./sql/import-database.sh
```

### Manual Method

1. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Select the database:
   ```sql
   USE microservices;
   ```

3. Paste the contents of `init-database.sql` and execute

## Environment Variables

When using the import script, ensure these environment variables are set:

- `MYSQL_HOST`: MySQL host (default: localhost)
- `MYSQL_PORT`: MySQL port (default: 3306)
- `MYSQL_USER`: MySQL username (default: root)
- `MYSQL_DATABASE`: Database name (default: microservices)

## Notes

- All timestamps use `CURRENT_TIMESTAMP` for automatic tracking
- Foreign key constraints ensure data integrity
- Indexes are created for frequently queried columns to improve performance
- Sample data provides realistic test scenarios for development and testing
- The script uses `CREATE TABLE IF NOT EXISTS` to prevent errors on re-runs

## Resetting Data

To reset the database and reload sample data:

```bash
# Drop tables (be careful with this!)
mysql -u root -p microservices -e "DROP TABLE IF EXISTS order_items; DROP TABLE IF EXISTS orders; DROP TABLE IF EXISTS products; DROP TABLE IF EXISTS merchants; DROP TABLE IF EXISTS users;"

# Re-run the import script
mysql -u root -p microservices < sql/init-database.sql
```
