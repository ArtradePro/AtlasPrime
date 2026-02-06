# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Rate Limiting
All API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

## Endpoints

### Health Check

#### GET /api/health
Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T11:39:50.913Z"
}
```

---

### Lead Management

#### GET /api/leads
Get all leads with optional filtering and search.

**Query Parameters:**
- `status` (optional): Filter by lead status (new, contacted, qualified, converted, lost)
- `source` (optional): Filter by lead source
- `search` (optional): Search by name, email, or company
- `sort` (optional): Sort field (default: created_at)
- `order` (optional): Sort order (ASC/DESC, default: DESC)

**Response:**
```json
{
  "leads": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-1234",
      "company": "Tech Corp",
      "job_title": "CTO",
      "industry": "Technology",
      "lead_source": "website",
      "lead_status": "new",
      "lead_score": 75,
      "notes": "Interested in enterprise solutions",
      "created_at": "2026-02-06 11:45:01",
      "updated_at": "2026-02-06 11:45:01"
    }
  ],
  "count": 1
}
```

#### GET /api/leads/:id
Get a specific lead by ID.

**URL Parameters:**
- `id`: Lead ID (integer)

**Response:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-1234",
  "company": "Tech Corp",
  "job_title": "CTO",
  "industry": "Technology",
  "lead_source": "website",
  "lead_status": "new",
  "lead_score": 75,
  "notes": "Interested in enterprise solutions",
  "created_at": "2026-02-06 11:45:01",
  "updated_at": "2026-02-06 11:45:01"
}
```

**Error Responses:**
- `404 Not Found`: Lead not found

#### POST /api/leads
Create a new lead.

**Request Body:**
```json
{
  "first_name": "John",          // Required
  "last_name": "Doe",            // Required
  "email": "john@example.com",   // Required (must be unique and valid)
  "phone": "+1-555-1234",        // Optional
  "company": "Tech Corp",        // Optional
  "job_title": "CTO",            // Optional
  "industry": "Technology",      // Optional
  "lead_source": "website",      // Optional
  "lead_status": "new",          // Optional (default: new)
  "lead_score": 75,              // Optional (default: 0)
  "notes": "Some notes"          // Optional
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Lead created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid email format
- `409 Conflict`: Email already exists

#### PUT /api/leads/:id
Update an existing lead.

**URL Parameters:**
- `id`: Lead ID (integer)

**Request Body:** (all fields optional, only provided fields will be updated)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-1234",
  "company": "Tech Corp",
  "job_title": "CTO",
  "industry": "Technology",
  "lead_source": "website",
  "lead_status": "contacted",
  "lead_score": 85,
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "message": "Lead updated successfully"
}
```

**Error Responses:**
- `404 Not Found`: Lead not found
- `500 Internal Server Error`: Database error

#### DELETE /api/leads/:id
Delete a lead.

**URL Parameters:**
- `id`: Lead ID (integer)

**Response:**
```json
{
  "message": "Lead deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Lead not found

---

### Statistics

#### GET /api/stats
Get lead statistics.

**Response:**
```json
{
  "total_leads": 10,
  "new_leads": 3,
  "contacted_leads": 4,
  "qualified_leads": 2,
  "converted_leads": 1,
  "avg_score": 72.5
}
```

---

### Export

#### GET /api/export
Export all leads as CSV file.

**Response:**
- Content-Type: text/csv
- Content-Disposition: attachment; filename=leads.csv
- Body: CSV formatted data with all lead information

---

## Data Models

### Lead Object
```typescript
{
  id: number;                    // Auto-generated
  first_name: string;            // Required
  last_name: string;             // Required
  email: string;                 // Required, unique
  phone: string | null;          // Optional
  company: string | null;        // Optional
  job_title: string | null;      // Optional
  industry: string | null;       // Optional
  lead_source: string | null;    // Optional: website, referral, social_media, email_campaign, event, other
  lead_status: string;           // Default: new, Options: new, contacted, qualified, converted, lost
  lead_score: number;            // Default: 0, Range: 0-100
  notes: string | null;          // Optional
  created_at: string;            // Auto-generated (ISO 8601)
  updated_at: string;            // Auto-generated (ISO 8601)
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Examples

### Using cURL

**Create a lead:**
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "company": "Marketing Inc",
    "lead_status": "new",
    "lead_score": 80
  }'
```

**Search leads:**
```bash
curl "http://localhost:3001/api/leads?search=jane&status=new"
```

**Update a lead:**
```bash
curl -X PUT http://localhost:3001/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "lead_status": "contacted",
    "lead_score": 90
  }'
```

**Delete a lead:**
```bash
curl -X DELETE http://localhost:3001/api/leads/1
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Get all leads
const leads = await axios.get(`${API_BASE_URL}/leads`);

// Create a lead
const newLead = await axios.post(`${API_BASE_URL}/leads`, {
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@example.com',
  company: 'Marketing Inc'
});

// Update a lead
await axios.put(`${API_BASE_URL}/leads/1`, {
  lead_status: 'contacted'
});

// Delete a lead
await axios.delete(`${API_BASE_URL}/leads/1`);

// Get statistics
const stats = await axios.get(`${API_BASE_URL}/stats`);

// Export leads
const csv = await axios.get(`${API_BASE_URL}/export`, {
  responseType: 'blob'
});
```
