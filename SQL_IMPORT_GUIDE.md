# SQL Import Guide - Microservices E-commerce System

## Overview

This guide provides detailed instructions on how to use the SQL import scripts for the microservices e-commerce system database.

## Database Structure

The system uses 5 main tables:

### 1. Users Table
Stores customer information
- **Fields**: id, name, email, phone, address, created_at, updated_at
- **Sample Data**: 5 users

### 2. Merchants Table
Stores merchant/seller information
- **Fields**: id, name, owner_id, description, phone, email, address, status, created_at, updated_at
- **Status Options**: active, inactive, suspended
- **Sample Data**: 5 merchants

### 3. Products Table
Stores product information
- **Fields**: id, name, merchant_id, description, price, stock, category, image_url, status, created_at, updated_at
- **Status Options**: active, inactive
- **Sample Data**: 15 products across 5 categories (Electronics, Clothing, Furniture, Sports, Beauty)

### 4. Orders Table
Stores order information
- **Fields**: id, user_id, total_price, status, created_at, updated_at
- **Status Options**: pending, confirmed, shipped, delivered, cancelled
- **Sample Data**: 5 orders

### 5. Order Items Table
Stores individual items in orders
- **Fields**: id, order_id, product_id, quantity, price, created_at
- **Relationships**: Foreign key to orders table
- **Sample Data**: 13 order items

## Import Methods

### Method 1: Using Shell Script (Recommended for Linux/Mac)

The shell script provides the most straightforward way to import the database.

#### Prerequisites
- MySQL or MariaDB installed and running
- Bash shell
- `mysql` command-line tool available

#### Steps

1. **Make the script executable** (if not already):
   ```bash
   chmod +x sql/import-database.sh
   ```

2. **Run the script with default settings**:
   ```bash
   ./sql/import-database.sh
   ```

3. **Or run with custom MySQL credentials**:
   ```bash
   MYSQL_HOST=127.0.0.1 \
   MYSQL_PORT=3306 \
   MYSQL_USER=root \
   MYSQL_PASSWORD=yourpassword \
   MYSQL_DATABASE=microservices \
   ./sql/import-database.sh
   ```

#### Script Output Example
```
==================================================
SQL Import Script - E-commerce System
==================================================

Configuration:
MySQL Host: localhost
MySQL Port: 3306
MySQL User: root
Database: microservices

Checking MySQL connection...
✓ MySQL connection successful

Database 'microservices' ready
✓ Database import successful

✓ All tables created successfully

Table Statistics:
users          | 5 rows
merchants      | 5 rows
products       | 15 rows
orders         | 5 rows
order_items    | 13 rows

==================================================
✓ Import completed successfully!
==================================================
```

### Method 2: Using Node.js Script

This method works on any platform where Node.js is installed.

#### Prerequisites
- Node.js and npm installed
- Dependencies: `mysql2` and `dotenv` packages

#### Steps

1. **Install dependencies**:
   ```bash
   npm install mysql2 dotenv
   ```

2. **Run the script**:
   ```bash
   node sql/import-database.js
   ```

3. **Or with environment variables**:
   ```bash
   DATABASE_HOST=localhost \
   DATABASE_PORT=3306 \
   DATABASE_USER=root \
   DATABASE_PASSWORD=root \
   DATABASE_NAME=microservices \
   node sql/import-database.js
   ```

### Method 3: Direct MySQL Command

For quick imports or CI/CD pipelines.

#### Using mysql command-line tool:
```bash
# Default credentials
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS microservices;"
mysql -u root -p microservices < sql/init-database.sql
```

#### With specific host and port:
```bash
mysql -h localhost -P 3306 -u root -p microservices < sql/init-database.sql
```

#### From within MySQL shell:
```bash
mysql -u root -p
```
Then in the MySQL shell:
```sql
CREATE DATABASE IF NOT EXISTS microservices;
USE microservices;
SOURCE sql/init-database.sql;
```

### Method 4: Docker Compose

If you're using Docker Compose, the database is typically initialized automatically.

#### Approach 1: Using existing container
```bash
# First, start the services
docker-compose up -d

# Then run the import in the MySQL container
docker exec microservices-mysql-1 mysql -u root -p root microservices < sql/init-database.sql
```

#### Approach 2: Using docker exec
```bash
# Copy the SQL file to the container
docker cp sql/init-database.sql microservices-mysql-1:/tmp/

# Run the import
docker exec microservices-mysql-1 mysql -u root -p root microservices < /tmp/init-database.sql
```

## Configuration

### Environment Variables

All scripts support the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_HOST` | localhost | MySQL server hostname |
| `DATABASE_PORT` | 3306 | MySQL server port |
| `DATABASE_USER` | root | MySQL username |
| `DATABASE_PASSWORD` | root | MySQL password |
| `DATABASE_NAME` | microservices | Database name |

### .env File Configuration

You can also create a `.env` file in the project root:

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=microservices
```

## Sample Data

### Users (5 total)
- John Doe (john.doe@example.com)
- Jane Smith (jane.smith@example.com)
- Bob Johnson (bob.johnson@example.com)
- Alice Williams (alice.williams@example.com)
- Charlie Brown (charlie.brown@example.com)

### Merchants (5 total)
- TechGear Store (Electronics)
- Fashion Plus (Clothing)
- Home Essentials (Furniture)
- Sports World (Sports Equipment)
- Beauty Hub (Cosmetics)

### Products (15 total)
- 3 Electronics products (Headphones, Charger, Laptop Stand)
- 3 Clothing products (T-Shirt, Jeans, Belt)
- 3 Furniture products (Dining Table, Office Chair, Wall Clock)
- 3 Sports products (Running Shoes, Yoga Mat, Dumbbells)
- 3 Beauty products (Lip Balm, Foundation, Face Mask)

### Orders (5 total)
Sample orders with various statuses (pending, confirmed, shipped, delivered)

## Verification

After successful import, verify the data:

### Using MySQL shell:
```sql
-- Check table counts
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'merchants', COUNT(*) FROM merchants
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;

-- Check sample users
SELECT * FROM users LIMIT 5;

-- Check sample products with merchant names
SELECT p.*, m.name as merchant_name 
FROM products p 
JOIN merchants m ON p.merchant_id = m.id 
LIMIT 5;

-- Check orders with details
SELECT o.*, u.name as customer_name, COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
LIMIT 5;
```

## Troubleshooting

### Connection Issues

**Error**: "Can't connect to MySQL server"
- **Solution**: Ensure MySQL is running
  ```bash
  # For local MySQL
  mysql.server start

  # Or check if already running
  ps aux | grep mysql
  ```

### Permission Issues

**Error**: "Access denied for user"
- **Solution**: Check MySQL credentials
  ```bash
  # Try connecting directly
  mysql -h localhost -u root -p

  # Verify user exists
  mysql -u root -p -e "SELECT user, host FROM mysql.user;"
  ```

### Database/Table Already Exists

**Error**: "Duplicate entry" or "Table already exists"
- **Solution**: The scripts use `CREATE TABLE IF NOT EXISTS`, so this shouldn't occur. If it does:
  ```bash
  # Reset the database
  mysql -u root -p -e "DROP DATABASE microservices; CREATE DATABASE microservices;"
  
  # Then re-run the import
  ./sql/import-database.sh
  ```

### Character Encoding Issues

If you see strange characters in the data:
```sql
-- Check database encoding
SELECT @@character_set_database, @@collation_database;

-- Fix encoding (run before import)
ALTER DATABASE microservices CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Performance Optimization

The import script creates indexes on frequently queried columns:

- `users.email`
- `merchants.status`
- `products.merchant_id`
- `products.status`
- `orders.user_id`
- `orders.status`
- `order_items.order_id`
- `order_items.product_id`

These indexes are created automatically during import.

## Backing Up Data

Before modifying the database, create a backup:

```bash
# Create a backup
mysqldump -u root -p microservices > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u root -p microservices < backup_TIMESTAMP.sql
```

## Re-importing Data

To reset the database and re-import sample data:

```bash
# Option 1: Drop and recreate
mysql -u root -p -e "DROP DATABASE microservices;"
./sql/import-database.sh

# Option 2: Delete all data but keep schema
mysql -u root -p microservices << EOF
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM merchants;
DELETE FROM users;
EOF

# Then re-run import for data only (modify script)
```

## API Testing with Sample Data

Once imported, you can test your APIs:

```bash
# Get all users
curl http://localhost:8081/

# Get user by ID
curl http://localhost:8081/1

# Get all merchants
curl http://localhost:8082/

# Get products by merchant
curl http://localhost:8083/

# Get orders
curl http://localhost:8084/
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main README.md
3. Check QUICK_START.md for general setup
4. Verify MySQL configuration and credentials

## Related Files

- `sql/init-database.sql` - Main SQL schema and data
- `sql/import-database.sh` - Bash import script
- `sql/import-database.js` - Node.js import script
- `sql/README.md` - SQL directory documentation
