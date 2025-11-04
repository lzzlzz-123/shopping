# SQL Scripts Index

## Overview

This directory contains all SQL-related scripts and documentation for the microservices e-commerce system database.

## Files

### 📄 Documentation

| File | Purpose | Audience |
|------|---------|----------|
| [README.md](./README.md) | SQL directory documentation and schema overview | Developers |
| [QUICK_START.md](./QUICK_START.md) | 30-second quick start guide for database import | All users |
| [INDEX.md](./INDEX.md) | This file - overview of all SQL files | All users |

### 🗄️ SQL Files

| File | Purpose | Format | Size |
|------|---------|--------|------|
| [init-database.sql](./init-database.sql) | Main SQL schema and sample data import | SQL | 6.6 KB |

### 🚀 Import Scripts

| File | Technology | Platform | Status |
|------|-----------|----------|--------|
| [import-database.sh](./import-database.sh) | Bash | Linux/Mac | ✅ Executable |
| [import-database.js](./import-database.js) | Node.js | Cross-platform | ✅ Executable |

## Quick Access

### I want to...

**Import the database**
- Use Shell: `./sql/import-database.sh`
- Use Node.js: `node sql/import-database.js`
- Direct MySQL: `mysql -u root -p microservices < sql/init-database.sql`

**Read the documentation**
- Quick Start: See [QUICK_START.md](./QUICK_START.md)
- Detailed Guide: See [../SQL_IMPORT_GUIDE.md](../SQL_IMPORT_GUIDE.md)
- Schema Details: See [README.md](./README.md)

**Understand the database structure**
- Tables: 5 (users, merchants, products, orders, order_items)
- Sample Data: 38 records total
- Indexes: 8 performance indexes
- See [README.md](./README.md) for full schema

**Troubleshoot issues**
- Connection problems: See [../SQL_IMPORT_GUIDE.md#troubleshooting](../SQL_IMPORT_GUIDE.md#troubleshooting)
- Import errors: See [README.md](./README.md#notes)

## Database Schema Summary

### Tables (5 total)

```
users                 5 rows  │ Customers
├─ id (PK)
├─ name
├─ email (UNIQUE)
├─ phone
├─ address
└─ timestamps

merchants            5 rows  │ Sellers
├─ id (PK)
├─ name
├─ owner_id
├─ description
├─ status (ENUM)
└─ timestamps

products            15 rows  │ Items for sale
├─ id (PK)
├─ name
├─ merchant_id (FK)
├─ description
├─ price
├─ stock
├─ category
├─ status (ENUM)
└─ timestamps

orders               5 rows  │ Customer orders
├─ id (PK)
├─ user_id (FK)
├─ total_price
├─ status (ENUM)
└─ timestamps

order_items         13 rows  │ Items in orders
├─ id (PK)
├─ order_id (FK)
├─ product_id
├─ quantity
├─ price
└─ created_at
```

### Indexes (8 total)
- `idx_users_email` - Fast email lookups
- `idx_merchants_status` - Filter by merchant status
- `idx_products_merchant_id` - Find products by merchant
- `idx_products_status` - Filter active/inactive products
- `idx_orders_user_id` - Find orders by user
- `idx_orders_status` - Filter orders by status
- `idx_order_items_order_id` - Get items in order (CASCADE)
- `idx_order_items_product_id` - Product usage tracking

## Import Methods Comparison

| Method | Pros | Cons | When to Use |
|--------|------|------|------------|
| **Shell Script** | User-friendly, colorized output, error handling | Requires Bash, Linux/Mac only | Local development on Unix |
| **Node.js Script** | Cross-platform, matches project stack, detailed logging | Requires Node.js installed | Development, CI/CD pipelines |
| **Direct MySQL** | Simplest, no scripts needed, fastest | Minimal error feedback | Quick testing, production |
| **Docker Exec** | Works in containerized environment | Requires Docker | Containerized deployments |

## Sample Data

### Users (5)
```
ID  Name              Email                      Phone
1   John Doe          john.doe@example.com       1234567890
2   Jane Smith        jane.smith@example.com     0987654321
3   Bob Johnson       bob.johnson@example.com    5555555555
4   Alice Williams    alice.williams@example.com 4444444444
5   Charlie Brown     charlie.brown@example.com  3333333333
```

### Merchants (5)
```
ID  Name              Category         Status
1   TechGear Store    Electronics      active
2   Fashion Plus      Clothing         active
3   Home Essentials   Furniture        active
4   Sports World      Sports           active
5   Beauty Hub        Beauty           active
```

### Products (15)
```
Category    Count  Examples
Electronics 3      Headphones, Charger, Laptop Stand
Clothing    3      T-Shirt, Jeans, Belt
Furniture   3      Dining Table, Office Chair, Wall Clock
Sports      3      Running Shoes, Yoga Mat, Dumbbells
Beauty      3      Lip Balm, Foundation, Face Mask
```

### Orders (5)
```
Order  User  Items  Total    Status
1      1     2      $229.97  confirmed
2      2     3      $99.99   pending
3      3     2      $539.98  shipped
4      4     3      $154.98  delivered
5      5     2      $89.98   pending
```

## Setup Requirements

### Minimum Requirements
- MySQL 5.7+ or MariaDB 10.2+
- Database credentials (user/password)
- Network access to MySQL server

### For Shell Script
- Bash 3.0+
- `mysql` command-line client

### For Node.js Script
- Node.js 10.0+
- npm or yarn (to install mysql2)

### For Direct Import
- `mysql` command-line client
- Basic SQL knowledge

## Configuration

### Environment Variables
```bash
DATABASE_HOST=localhost      # Default: localhost
DATABASE_PORT=3306          # Default: 3306
DATABASE_USER=root          # Default: root
DATABASE_PASSWORD=root      # Default: root
DATABASE_NAME=microservices # Default: microservices
```

### Using .env File
Create `.env` in project root:
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=microservices
```

## Execution Flow

### Shell Script Flow
```
1. Read configuration
2. Check MySQL connection
3. Verify/create database
4. Execute SQL statements
5. Verify tables created
6. Display statistics
7. Report status
```

### Node.js Script Flow
```
1. Load environment variables
2. Connect to MySQL
3. Create database if needed
4. Read SQL file
5. Parse statements
6. Execute each statement
7. Handle errors gracefully
8. Verify tables
9. Display statistics
10. Report completion
```

## Performance Considerations

- **Import Time**: ~2-5 seconds for sample data
- **File Size**: 6.6 KB SQL file
- **Memory Usage**: Minimal (< 50 MB)
- **Network**: Requires active MySQL connection

## Security Notes

⚠️ **Important**: Sample data includes default credentials for local development only.

For production:
1. Use strong MySQL passwords
2. Don't commit passwords to version control
3. Use environment variables for sensitive data
4. Run import scripts with minimal required permissions
5. Audit database access logs regularly

## Maintenance

### Backup Data
```bash
mysqldump -u root -p microservices > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -u root -p microservices < backup_20240101.sql
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE microservices;"
./sql/import-database.sh
```

## Troubleshooting

### Connection Issues
- **Error**: "Can't connect to MySQL server"
- **Fix**: Ensure MySQL is running and accessible

### Permission Issues
- **Error**: "Access denied for user 'root'@'localhost'"
- **Fix**: Check MySQL credentials in environment variables

### Table Already Exists
- **Error**: "Table 'users' already exists"
- **Fix**: Use `DROP DATABASE microservices;` then re-run import

### Port Conflicts
- **Error**: "Port 3306 already in use"
- **Fix**: Change MYSQL_PORT to available port

See [../SQL_IMPORT_GUIDE.md](../SQL_IMPORT_GUIDE.md) for detailed troubleshooting.

## Related Documentation

- [../README.md](../README.md) - Project overview
- [../QUICK_START.md](../QUICK_START.md) - Getting started (includes SQL section)
- [../SQL_IMPORT_GUIDE.md](../SQL_IMPORT_GUIDE.md) - Comprehensive import guide
- [./README.md](./README.md) - SQL directory documentation
- [./QUICK_START.md](./QUICK_START.md) - 30-second quick start

## Support

For questions or issues:
1. Review the quick start guide: [QUICK_START.md](./QUICK_START.md)
2. Check detailed documentation: [../SQL_IMPORT_GUIDE.md](../SQL_IMPORT_GUIDE.md)
3. Review troubleshooting section above
4. Check system MySQL logs
5. Verify network connectivity

## Contributing

To update the import scripts:
1. Modify the SQL file first (`init-database.sql`)
2. Test with all three import methods
3. Update documentation if schema changes
4. Commit with clear messages
5. Reference any related issues

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready ✅
