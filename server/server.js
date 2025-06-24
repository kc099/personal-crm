import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DBNAME,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Customers endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, email, phone, company, address, notes } = req.body;
  try {
    console.log('Creating customer with data:', { name, email, phone, company, address, notes });
    
    // Convert empty strings to null for optional fields
    const emailValue = email && email.trim() !== '' ? email : null;
    const phoneValue = phone && phone.trim() !== '' ? phone : null;
    const companyValue = company && company.trim() !== '' ? company : null;
    const addressValue = address && address.trim() !== '' ? address : null;
    const notesValue = notes && notes.trim() !== '' ? notes : null;
    
    const result = await pool.query(
      'INSERT INTO customers (name, email, phone, company, address, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, emailValue, phoneValue, companyValue, addressValue, notesValue]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email address already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, address, notes } = req.body;
  try {
    console.log('Updating customer with data:', { id, name, email, phone, company, address, notes });
    
    // Convert empty strings to null for optional fields
    const emailValue = email && email.trim() !== '' ? email : null;
    const phoneValue = phone && phone.trim() !== '' ? phone : null;
    const companyValue = company && company.trim() !== '' ? company : null;
    const addressValue = address && address.trim() !== '' ? address : null;
    const notesValue = notes && notes.trim() !== '' ? notes : null;
    
    const result = await pool.query(
      'UPDATE customers SET name=$1, email=$2, phone=$3, company=$4, address=$5, notes=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
      [name, emailValue, phoneValue, companyValue, addressValue, notesValue, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email address already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM customers WHERE id=$1', [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as customer_name, c.company as customer_company
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, description, customer_id, tech_stack, github_link, status, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, customer_id, tech_stack, github_link, status, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, customer_id, tech_stack, github_link, status, start_date, end_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, customer_id, tech_stack, github_link, status, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE projects SET name=$1, description=$2, customer_id=$3, tech_stack=$4, github_link=$5, status=$6, start_date=$7, end_date=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9 RETURNING *',
      [name, description, customer_id, tech_stack, github_link, status, start_date, end_date, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id=$1', [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Milestones endpoints
app.get('/api/projects/:projectId/milestones', async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM milestones WHERE project_id=$1 ORDER BY target_date', [projectId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:projectId/milestones', async (req, res) => {
  const { projectId } = req.params;
  const { title, description, milestone_type, target_date, amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO milestones (project_id, title, description, milestone_type, target_date, amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [projectId, title, description, milestone_type, target_date, amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/milestones/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, milestone_type, target_date, completed_date, amount, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE milestones SET title=$1, description=$2, milestone_type=$3, target_date=$4, completed_date=$5, amount=$6, status=$7, updated_at=CURRENT_TIMESTAMP WHERE id=$8 RETURNING *',
      [title, description, milestone_type, target_date, completed_date, amount, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activities endpoints
app.get('/api/projects/:projectId/activities', async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM activities WHERE project_id=$1 ORDER BY activity_date DESC, created_at DESC', [projectId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:projectId/activities', async (req, res) => {
  const { projectId } = req.params;
  const { title, description, activity_type, hours, amount, activity_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO activities (project_id, title, description, activity_type, hours, amount, activity_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [projectId, title, description, activity_type, hours, amount, activity_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});