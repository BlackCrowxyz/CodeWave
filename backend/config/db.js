import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'uniquepaliwal',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'trip_advisor',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

export default pool;
