import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database initialization script for Railway deployment
async function initializeDatabase() {
  console.log('🔧 Initializing database...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    // Read SQL file from backend folder
    const sqlFilePath = path.join(__dirname, '../database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remove CREATE DATABASE and USE statements for Railway MySQL
    const cleanedSQL = sqlContent
      .replace(/CREATE DATABASE IF NOT EXISTS.*;/g, '')
      .replace(/USE.*;/g, '')
      .trim();

    // Execute SQL
    await connection.execute(cleanedSQL);
    console.log('✅ Database tables created successfully!');
    
    // Verify tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables created:', tables.map(t => Object.values(t)[0]));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase; 