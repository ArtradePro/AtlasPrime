const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Initialize SQLite database
const dbPath = path.join(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create tables if they don't exist
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      company TEXT,
      job_title TEXT,
      industry TEXT,
      lead_source TEXT,
      lead_status TEXT DEFAULT 'new',
      lead_score INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating leads table:', err);
    } else {
      console.log('Leads table ready');
    }
  });
}

// API Routes

// Get all leads
app.get('/api/leads', (req, res) => {
  const { status, source, search, sort = 'created_at', order = 'DESC' } = req.query;
  
  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND lead_status = ?';
    params.push(status);
  }
  
  if (source) {
    query += ' AND lead_source = ?';
    params.push(source);
  }
  
  if (search) {
    query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  query += ` ORDER BY ${sort} ${order}`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ leads: rows, count: rows.length });
    }
  });
});

// Get single lead by ID
app.get('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Lead not found' });
    } else {
      res.json(row);
    }
  });
});

// Create new lead
app.post('/api/leads', (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    job_title,
    industry,
    lead_source,
    lead_status = 'new',
    lead_score = 0,
    notes
  } = req.body;
  
  // Validation
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  const query = `
    INSERT INTO leads (
      first_name, last_name, email, phone, company, 
      job_title, industry, lead_source, lead_status, lead_score, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(
    query,
    [first_name, last_name, email, phone, company, job_title, industry, lead_source, lead_status, lead_score, notes],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(409).json({ error: 'A lead with this email already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
      } else {
        res.status(201).json({ 
          id: this.lastID,
          message: 'Lead created successfully'
        });
      }
    }
  );
});

// Update lead
app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    job_title,
    industry,
    lead_source,
    lead_status,
    lead_score,
    notes
  } = req.body;
  
  const query = `
    UPDATE leads SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      company = COALESCE(?, company),
      job_title = COALESCE(?, job_title),
      industry = COALESCE(?, industry),
      lead_source = COALESCE(?, lead_source),
      lead_status = COALESCE(?, lead_status),
      lead_score = COALESCE(?, lead_score),
      notes = COALESCE(?, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(
    query,
    [first_name, last_name, email, phone, company, job_title, industry, lead_source, lead_status, lead_score, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Lead not found' });
      } else {
        res.json({ message: 'Lead updated successfully' });
      }
    }
  );
});

// Delete lead
app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Lead not found' });
    } else {
      res.json({ message: 'Lead deleted successfully' });
    }
  });
});

// Get lead statistics
app.get('/api/stats', (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_leads,
      SUM(CASE WHEN lead_status = 'new' THEN 1 ELSE 0 END) as new_leads,
      SUM(CASE WHEN lead_status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
      SUM(CASE WHEN lead_status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
      SUM(CASE WHEN lead_status = 'converted' THEN 1 ELSE 0 END) as converted_leads,
      AVG(lead_score) as avg_score
    FROM leads
  `;
  
  db.get(statsQuery, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row);
    }
  });
});

// Export leads to CSV
app.get('/api/export', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Convert to CSV
      if (rows.length === 0) {
        return res.send('');
      }
      
      const headers = Object.keys(rows[0]).join(',');
      const csvRows = rows.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      
      const csv = [headers, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
      res.send(csv);
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Lead Generation API server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
