import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    industry: '',
    lead_source: '',
    lead_status: 'new',
    lead_score: 0,
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [searchTerm, filterStatus]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await axios.get(`${API_BASE_URL}/leads?${params}`);
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Failed to fetch leads. Make sure the backend server is running.');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await axios.put(`${API_BASE_URL}/leads/${selectedLead.id}`, formData);
        alert('Lead updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/leads`, formData);
        alert('Lead created successfully!');
      }
      
      resetForm();
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert(error.response?.data?.error || 'Failed to save lead');
    }
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setFormData(lead);
    setShowForm(true);
    setCurrentView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`${API_BASE_URL}/leads/${id}`);
        alert('Lead deleted successfully!');
        fetchLeads();
        fetchStats();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting leads:', error);
      alert('Failed to export leads');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      job_title: '',
      industry: '',
      lead_source: '',
      lead_status: 'new',
      lead_score: 0,
      notes: ''
    });
    setSelectedLead(null);
    setShowForm(false);
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.total_leads || 0}</h3>
            <p>Total Leads</p>
          </div>
          <div className="stat-card new">
            <h3>{stats.new_leads || 0}</h3>
            <p>New Leads</p>
          </div>
          <div className="stat-card contacted">
            <h3>{stats.contacted_leads || 0}</h3>
            <p>Contacted</p>
          </div>
          <div className="stat-card qualified">
            <h3>{stats.qualified_leads || 0}</h3>
            <p>Qualified</p>
          </div>
          <div className="stat-card converted">
            <h3>{stats.converted_leads || 0}</h3>
            <p>Converted</p>
          </div>
          <div className="stat-card score">
            <h3>{stats.avg_score ? stats.avg_score.toFixed(1) : 0}</h3>
            <p>Avg Score</p>
          </div>
        </div>
      )}
      
      <div className="recent-leads">
        <h3>Recent Leads</h3>
        {renderLeadsList(leads.slice(0, 5))}
      </div>
    </div>
  );

  const renderLeadsList = (leadsToShow = leads) => (
    <div className="leads-list">
      {leadsToShow.length === 0 ? (
        <p className="no-data">No leads found. Create your first lead!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Score</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leadsToShow.map(lead => (
              <tr key={lead.id}>
                <td>{lead.first_name} {lead.last_name}</td>
                <td>{lead.email}</td>
                <td>{lead.company || '-'}</td>
                <td>
                  <span className={`status-badge ${lead.lead_status}`}>
                    {lead.lead_status}
                  </span>
                </td>
                <td>{lead.lead_score}</td>
                <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(lead)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(lead.id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderAllLeads = () => (
    <div className="all-leads">
      <h2>All Leads</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <button onClick={handleExport} className="btn-export">
          Export CSV
        </button>
      </div>
      {renderLeadsList()}
    </div>
  );

  const renderForm = () => (
    <div className="lead-form">
      <h2>{selectedLead ? 'Edit Lead' : 'New Lead'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Lead Source</label>
            <select
              name="lead_source"
              value={formData.lead_source}
              onChange={handleInputChange}
            >
              <option value="">Select Source</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social_media">Social Media</option>
              <option value="email_campaign">Email Campaign</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select
              name="lead_status"
              value={formData.lead_status}
              onChange={handleInputChange}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Lead Score (0-100)</label>
            <input
              type="number"
              name="lead_score"
              value={formData.lead_score}
              onChange={handleInputChange}
              min="0"
              max="100"
            />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {selectedLead ? 'Update Lead' : 'Create Lead'}
          </button>
          <button type="button" onClick={() => {
            resetForm();
            setCurrentView('dashboard');
          }} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎯 AtlasPrime - Lead Generation</h1>
        <nav className="nav-menu">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={currentView === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('leads')}
            className={currentView === 'leads' ? 'active' : ''}
          >
            All Leads
          </button>
          <button 
            onClick={() => {
              resetForm();
              setCurrentView('form');
              setShowForm(true);
            }}
            className={currentView === 'form' ? 'active' : ''}
          >
            New Lead
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'leads' && renderAllLeads()}
        {currentView === 'form' && renderForm()}
      </main>

      <footer className="app-footer">
        <p>AtlasPrime Lead Generation System © 2026</p>
      </footer>
    </div>
  );
}

export default App;
