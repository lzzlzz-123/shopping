#!/bin/bash

# SQL Import Script for Microservices E-commerce System
# This script imports the database schema and sample data

set -e

# Configuration
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-root}"
MYSQL_DATABASE="${MYSQL_DATABASE:-microservices}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}SQL Import Script - E-commerce System${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Display configuration
echo -e "${YELLOW}Configuration:${NC}"
echo "MySQL Host: $MYSQL_HOST"
echo "MySQL Port: $MYSQL_PORT"
echo "MySQL User: $MYSQL_USER"
echo "Database: $MYSQL_DATABASE"
echo ""

# Check if MySQL is available
echo -e "${YELLOW}Checking MySQL connection...${NC}"
if ! mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}✗ Failed to connect to MySQL${NC}"
    echo -e "${RED}Please ensure MySQL is running and credentials are correct${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MySQL connection successful${NC}"
echo ""

# Check if database exists, create if not
echo -e "${YELLOW}Checking database...${NC}"
if ! mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" > /dev/null 2>&1; then
    echo -e "${YELLOW}Database '$MYSQL_DATABASE' not found. Creating...${NC}"
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE;"
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi
echo ""

# Check if init script exists
if [ ! -f "$SCRIPT_DIR/init-database.sql" ]; then
    echo -e "${RED}✗ init-database.sql not found in $SCRIPT_DIR${NC}"
    exit 1
fi

# Import the SQL script
echo -e "${YELLOW}Importing database schema and sample data...${NC}"
if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$SCRIPT_DIR/init-database.sql" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database import successful${NC}"
else
    echo -e "${RED}✗ Database import failed${NC}"
    exit 1
fi
echo ""

# Verify tables were created
echo -e "${YELLOW}Verifying tables...${NC}"
TABLES=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SHOW TABLES;" | wc -l)

if [ "$TABLES" -ge 6 ]; then
    echo -e "${GREEN}✓ All tables created successfully${NC}"
    
    # Display table statistics
    echo ""
    echo -e "${YELLOW}Table Statistics:${NC}"
    
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" << EOF
SELECT 
    'users' as table_name, 
    COUNT(*) as row_count 
FROM users
UNION ALL
SELECT 
    'merchants', 
    COUNT(*) 
FROM merchants
UNION ALL
SELECT 
    'products', 
    COUNT(*) 
FROM products
UNION ALL
SELECT 
    'orders', 
    COUNT(*) 
FROM orders
UNION ALL
SELECT 
    'order_items', 
    COUNT(*) 
FROM order_items;
EOF
else
    echo -e "${RED}✗ Table creation verification failed${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Import completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start your services: docker-compose up -d"
echo "2. Access your application"
echo "3. Use the sample data for testing"
echo ""
