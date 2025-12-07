const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function initAdminDb() {
  console.log('🔄 Initializing Admin Database...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_db',
    multipleStatements: true
  });

  try {
    // 1. Add role column to users if it doesn't exist
    try {
      console.log('Checking users table...');
      const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
      if (columns.length === 0) {
        console.log('Adding role column to users table...');
        await connection.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'editor', 'admin', 'super_admin') DEFAULT 'user' AFTER password_hash");
      } else {
        console.log('Role column already exists.');
      }
    } catch (err) {
      console.error('Error modifying users table:', err.message);
    }

    // 2. Create posts table
    console.log('Creating posts table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INT,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 3. Create categories table
    console.log('Creating categories table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create post_categories junction table
    console.log('Creating post_categories table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_categories (
        post_id INT,
        category_id INT,
        PRIMARY KEY (post_id, category_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // 5. Create comments table
    console.log('Creating comments table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT,
        user_id INT,
        content TEXT NOT NULL,
        status ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 6. Create activity_logs table
    console.log('Creating activity_logs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 7. Create Admin User
    console.log('Creating/Updating admin user...');
    // hash for 'admin123'
    const passwordHash = '$2a$10$rKZLvXF5xJ5YhGqxQx.KnOYJ9vXqZQxGxJ5YhGqxQx.KnOYJ9vXqZ';

    // Check if admin exists
    const [admins] = await connection.query("SELECT id FROM users WHERE email = 'admin@blog.com'");

    if (admins.length > 0) {
      // Update role if exists
      await connection.query("UPDATE users SET role = 'super_admin' WHERE email = 'admin@blog.com'");
      console.log('Admin user updated.');
    } else {
      // Insert if not exists
      await connection.query(`
        INSERT INTO users (email, password_hash, name, role) 
        VALUES ('admin@blog.com', ?, 'Admin User', 'super_admin')
      `, [passwordHash]);
      console.log('Admin user created.');
    }

    console.log('✅ Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await connection.end();
  }
}

initAdminDb();
