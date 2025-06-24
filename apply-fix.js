import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DBNAME,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function applyFix() {
  try {
    console.log('Applying email constraint fix...');
    
    const sqlScript = fs.readFileSync('./fix-email-constraint.sql', 'utf8');
    await pool.query(sqlScript);
    
    console.log('Email constraint fix applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying fix:', error);
    process.exit(1);
  }
}

applyFix();