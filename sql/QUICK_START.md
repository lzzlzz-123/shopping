# Quick Start - SQL Database Import

## TL;DR - Get Started in 30 Seconds

### For Linux/Mac Users
```bash
chmod +x sql/import-database.sh
./sql/import-database.sh
```

### For All Platforms
```bash
npm install mysql2 dotenv --save-dev
node sql/import-database.js
```

### Using MySQL CLI
```bash
mysql -u root -p microservices < sql/init-database.sql
```

## What This Does

Creates and initializes a complete microservices e-commerce database with:
- **5 sample users** ready for login testing
- **5 merchant/seller accounts** with different product categories
- **15 sample products** across 5 categories
- **5 sample orders** in different statuses
- **All necessary database tables** with proper relationships and indexes

## Required Credentials

**Default MySQL Credentials** (can be overridden with env vars):
- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: `root`
- **Database**: `microservices`

## Import Methods at a Glance

| Method | Command | Best For |
|--------|---------|----------|
| **Shell Script** | `./sql/import-database.sh` | Linux/Mac developers |
| **Node.js** | `node sql/import-database.js` | Cross-platform, CI/CD |
| **Direct MySQL** | `mysql -u root -p microservices < sql/init-database.sql` | Quick import, scripting |
| **Docker** | `docker exec mysql-container mysql -u root -p microservices < sql/init-database.sql` | Docker environments |

## Custom Configuration

### Using Environment Variables
```bash
# Linux/Mac
export MYSQL_HOST=192.168.1.100
export MYSQL_PORT=3307
export MYSQL_USER=admin
export MYSQL_PASSWORD=secret123
./sql/import-database.sh

# Or inline
MYSQL_USER=admin MYSQL_PASSWORD=secret123 ./sql/import-database.sh
```

### Using .env File
Create a `.env` file in project root:
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=microservices
```

## Verification

Check that data was imported successfully:

```bash
# Quick check
mysql -u root -p microservices -e "
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'merchants', COUNT(*) FROM merchants
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
"
```

Expected output:
```
| table_name  | rows |
|-------------|------|
| users       |    5 |
| merchants   |    5 |
| products    |   15 |
| orders      |    5 |
| order_items |   13 |
```

## Sample Users for Testing

| Email | Password | Use Case |
|-------|----------|----------|
| john.doe@example.com | (see note) | Regular customer |
| jane.smith@example.com | (see note) | Regular customer |
| bob.johnson@example.com | (see note) | Regular customer |
| alice.williams@example.com | (see note) | Regular customer |
| charlie.brown@example.com | (see note) | Regular customer |

**Note**: Sample data does not include passwords in the default schema. Add authentication later or use IDs directly for API testing.

## API Testing Examples

Once your services are running (docker-compose up -d):

```bash
# Get all users
curl http://localhost:8081/

# Get user #1
curl http://localhost:8081/1

# Get all merchants
curl http://localhost:8082/

# Get all products (with merchant info)
curl http://localhost:8083/

# Get all orders
curl http://localhost:8084/

# Get order #1 with items
curl http://localhost:8084/1
```

## Troubleshooting

### MySQL Not Running
```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1;"

# If not, start it
# On Mac with Homebrew:
brew services start mysql

# On Linux:
sudo systemctl start mysql
# or
sudo service mysql start
```

### Connection Denied
```bash
# Test connection with credentials
mysql -h localhost -u root -p root

# If it fails, reset MySQL user
# (This is a more complex operation - see full guide)
```

### Port 3306 Already in Use
```bash
# Find what's using port 3306
lsof -i :3306

# Kill the process (be careful!)
kill -9 <PID>

# Or use different port in env vars
MYSQL_PORT=3307 ./sql/import-database.sh
```

### Import Script Not Executable
```bash
# Make it executable
chmod +x sql/import-database.sh

# Or use directly with bash
bash sql/import-database.sh
```

## Next Steps

1. ✅ Run the import script (see TL;DR above)
2. ✅ Verify data was imported (see Verification section)
3. 🚀 Start services: `docker-compose up -d`
4. 🧪 Test APIs (see API Testing Examples above)
5. 📚 Read [SQL_IMPORT_GUIDE.md](../SQL_IMPORT_GUIDE.md) for detailed info

## File Reference

- **sql/init-database.sql** - SQL schema and sample data (1,200+ lines)
- **sql/import-database.sh** - Bash import script (cross-platform compatible)
- **sql/import-database.js** - Node.js import script (pure JavaScript)
- **sql/README.md** - Detailed SQL documentation
- **SQL_IMPORT_GUIDE.md** - Comprehensive import guide (in project root)

## Key Features

✨ **What's Included**:
- ✅ Automatic database creation
- ✅ All 5 tables with relationships
- ✅ Performance indexes on key columns
- ✅ Foreign key constraints
- ✅ Realistic sample data
- ✅ Error handling and verification
- ✅ Colored output for easy reading
- ✅ Works on Linux, Mac, Windows (with WSL)
- ✅ Docker compatible

## Support & Issues

If you encounter problems:
1. Check the troubleshooting section above
2. Review the full [SQL_IMPORT_GUIDE.md](../SQL_IMPORT_GUIDE.md)
3. Check system MySQL version and compatibility
4. Ensure network connectivity to MySQL server

Happy testing! 🎉
