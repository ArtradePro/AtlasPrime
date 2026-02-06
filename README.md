# AtlasPrime - Lead Generation Software

AtlasPrime is a comprehensive Lead Generation software application designed to help businesses capture, manage, and convert leads efficiently.

## Features

### Core Functionality
- **Lead Capture**: Create and store lead information with comprehensive details
- **Lead Management**: View, edit, and delete leads with an intuitive interface
- **Lead Tracking**: Monitor lead status from initial contact to conversion
- **Lead Scoring**: Assign scores to prioritize leads (0-100 scale)
- **Dashboard Analytics**: Real-time statistics and metrics
- **Search & Filter**: Quickly find leads by name, email, company, or status
- **Export Functionality**: Export leads to CSV format for external use

### Lead Information Fields
- First Name & Last Name
- Email Address
- Phone Number
- Company Name
- Job Title
- Industry
- Lead Source (Website, Referral, Social Media, Email Campaign, Event, Other)
- Lead Status (New, Contacted, Qualified, Converted, Lost)
- Lead Score (0-100)
- Notes

## Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **SQLite** database for data persistence
- RESTful API architecture
- CORS enabled for cross-origin requests

### Frontend
- **React** 19.x for UI components
- **Axios** for API communication
- Modern, responsive CSS design
- Real-time data updates

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend application will open at `http://localhost:3000`

## API Endpoints

### Leads Management
- `GET /api/leads` - Get all leads (supports query params: status, source, search, sort, order)
- `GET /api/leads/:id` - Get a specific lead by ID
- `POST /api/leads` - Create a new lead
- `PUT /api/leads/:id` - Update an existing lead
- `DELETE /api/leads/:id` - Delete a lead

### Statistics
- `GET /api/stats` - Get lead statistics (total, by status, average score)

### Export
- `GET /api/export` - Export all leads as CSV

### Health Check
- `GET /api/health` - Check API server status

## Usage Guide

### Dashboard View
The dashboard provides an overview of your lead generation efforts:
- Total leads count
- Breakdown by status (New, Contacted, Qualified, Converted)
- Average lead score
- Recent leads list

### All Leads View
- View complete list of all leads
- Search leads by name, email, or company
- Filter leads by status
- Export leads to CSV
- Edit or delete individual leads

### New Lead Form
Create new leads by filling out the form with:
- Required fields: First Name, Last Name, Email
- Optional fields: Phone, Company, Job Title, Industry, Source, Status, Score, Notes
- Email validation ensures proper format
- Duplicate email detection

### Lead Editing
- Click "Edit" on any lead to modify its information
- All fields can be updated
- Changes are saved immediately to the database

## Project Structure

```
AtlasPrime/
├── backend/
│   ├── server.js          # Express server and API endpoints
│   ├── package.json       # Backend dependencies
│   ├── .gitignore        # Git ignore for node_modules and database
│   └── leads.db          # SQLite database (created automatically)
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Application styles
│   │   └── index.js      # React entry point
│   ├── package.json      # Frontend dependencies
│   └── .gitignore        # Git ignore for node_modules
└── README.md             # This file
```

## Development

### Running Both Servers
Open two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### Database
The SQLite database (`leads.db`) is created automatically when the backend starts for the first time. It's located in the `backend/` directory.

## Security Features
- Email validation on both frontend and backend
- Unique email constraint to prevent duplicates
- Input sanitization through prepared SQL statements
- CORS configuration for secure cross-origin requests

## Future Enhancements
Potential features for future versions:
- User authentication and authorization
- Email integration for automated follow-ups
- Advanced analytics and reporting
- Lead assignment to team members
- Activity timeline for each lead
- Integration with CRM systems
- Bulk import from CSV/Excel

## Contributing
This is a demonstration project for lead generation software. Feel free to fork and enhance with additional features.

## License
ISC

## Support
For issues or questions, please open an issue in the GitHub repository.

---

Built with ❤️ using Node.js, Express, React, and SQLite

