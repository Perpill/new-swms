import { Pool } from 'pg';

const pool = new Pool({
  user: 'youruser',
  host: 'localhost',
  database: 'yourdbname',
  password: 'yourpassword',
  port: 5432, // Default PostgreSQL port
});

export const query = (text: string, params?: any[]) => pool.query(text, params);