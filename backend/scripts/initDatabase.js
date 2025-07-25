const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Creating database tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT CHECK (LENGTH(address) <= 400),
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'store_owner')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create stores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL CHECK (LENGTH(address) <= 400),
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create ratings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )
    `);
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
    `);
    
    // Insert default admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    await client.query(`
      INSERT INTO users (name, email, password, address, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [
      'System Administrator User Name Here',
      'admin@example.com',
      adminPassword,
      '123 Admin Street, Admin City, Admin State 12345',
      'admin'
    ]);
    
    // Insert default store owner
    const storeOwnerPassword = await bcrypt.hash('Store123!', 12);
    
    console.log('Database initialized successfully!');
    console.log('Default accounts created:');
    console.log('Admin: admin@example.com / Admin123!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

initDatabase();
