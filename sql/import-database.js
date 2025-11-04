#!/usr/bin/env node

/**
 * SQL Import Script for Microservices E-commerce System
 * This script imports the database schema and sample data
 * 
 * Usage:
 *   node sql/import-database.js
 * 
 * Environment Variables:
 *   DATABASE_HOST - MySQL host (default: localhost)
 *   DATABASE_PORT - MySQL port (default: 3306)
 *   DATABASE_USER - MySQL user (default: root)
 *   DATABASE_PASSWORD - MySQL password (default: root)
 *   DATABASE_NAME - Database name (default: microservices)
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

// Configuration
const config = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'microservices'
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  let prefix = '';
  
  switch (type) {
    case 'success':
      prefix = `${colors.green}✓${colors.reset}`;
      break;
    case 'error':
      prefix = `${colors.red}✗${colors.reset}`;
      break;
    case 'warning':
      prefix = `${colors.yellow}⚠${colors.reset}`;
      break;
    case 'info':
      prefix = `${colors.yellow}ℹ${colors.reset}`;
      break;
    default:
      prefix = '•';
  }
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function logHeader(title) {
  console.log('');
  console.log(`${colors.yellow}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}${title}${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(50)}${colors.reset}`);
  console.log('');
}

async function main() {
  let connection;

  try {
    logHeader('SQL Import Script - E-commerce System');

    // Display configuration
    log('Configuration:', 'info');
    console.log(`  MySQL Host: ${config.host}`);
    console.log(`  MySQL Port: ${config.port}`);
    console.log(`  MySQL User: ${config.user}`);
    console.log(`  Database: ${config.database}`);
    console.log('');

    // Test connection
    log('Connecting to MySQL...', 'info');
    const tempConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    
    log('MySQL connection successful', 'success');
    await tempConnection.end();

    // Create database if not exists
    log('Creating database if not exists...', 'info');
    const createDbConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    
    await createDbConnection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    log(`Database '${config.database}' ready`, 'success');
    await createDbConnection.end();

    // Connect to the database
    log('Connecting to database...', 'info');
    connection = await mysql.createConnection(config);
    log('Database connection established', 'success');
    console.log('');

    // Read SQL file
    log('Reading SQL script...', 'info');
    const sqlPath = path.join(__dirname, 'init-database.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at ${sqlPath}`);
    }
    
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    log('SQL script loaded', 'success');
    console.log('');

    // Execute SQL statements
    log('Importing database schema and sample data...', 'info');
    
    // Split by semicolon and filter empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.query(statement);
        successCount++;
      } catch (error) {
        // Log warnings for non-critical errors (like index already exists)
        if (error.code === 'ER_DUP_KEYNAME') {
          log(`Warning: Index may already exist (${error.code})`, 'warning');
        } else {
          throw error;
        }
      }
    }

    log(`Successfully executed ${successCount} SQL statements`, 'success');
    console.log('');

    // Verify tables
    log('Verifying tables...', 'info');
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [config.database]
    );

    if (tables.length > 0) {
      log(`Found ${tables.length} tables`, 'success');
      tables.forEach(table => {
        console.log(`  • ${table.TABLE_NAME}`);
      });
      console.log('');
    } else {
      throw new Error('No tables found after import');
    }

    // Get table statistics
    log('Table Statistics:', 'info');
    const stats = [
      { table: 'users', query: 'SELECT COUNT(*) as count FROM users' },
      { table: 'merchants', query: 'SELECT COUNT(*) as count FROM merchants' },
      { table: 'products', query: 'SELECT COUNT(*) as count FROM products' },
      { table: 'orders', query: 'SELECT COUNT(*) as count FROM orders' },
      { table: 'order_items', query: 'SELECT COUNT(*) as count FROM order_items' }
    ];

    for (const stat of stats) {
      try {
        const [result] = await connection.query(stat.query);
        const count = result[0].count;
        console.log(`  • ${stat.table}: ${colors.bold}${count}${colors.reset} rows`);
      } catch (error) {
        console.log(`  • ${stat.table}: (error reading)`);
      }
    }
    console.log('');

    logHeader('✓ Import Completed Successfully!');

    console.log(`${colors.yellow}Next steps:${colors.reset}`);
    console.log('1. Start your services: docker-compose up -d');
    console.log('2. Access your application');
    console.log('3. Use the sample data for testing');
    console.log('');

  } catch (error) {
    logHeader('✗ Import Failed');
    log(`Error: ${error.message}`, 'error');
    console.log('');
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      log('Connection lost. Please ensure MySQL is running.', 'warning');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log('Access denied. Please check your MySQL credentials.', 'warning');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log('Database error. The database may not exist.', 'warning');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
