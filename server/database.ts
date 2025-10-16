import { Pool } from 'pg';

// Create a single database connection pool for the application
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the database connection
db.on('connect', () => {
  console.log('✅ Database connected successfully');
});

db.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});
