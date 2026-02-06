# AtlasPrime User Guide

## Getting Started

### Prerequisites
Before using AtlasPrime, ensure you have:
- Node.js (v14 or higher)
- npm (v6 or higher)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ArtradePro/AtlasPrime.git
cd AtlasPrime
```

2. **Set up the backend:**
```bash
cd backend
npm install
npm start
```

The backend server will start on `http://localhost:3001`

3. **Set up the frontend** (in a new terminal):
```bash
cd frontend
npm install
npm start
```

The frontend application will open at `http://localhost:3000`

## Features Overview

### 1. Dashboard

The Dashboard provides a quick overview of your lead generation efforts.

**What you'll see:**
- **Total Leads**: Overall count of all leads in the system
- **New Leads**: Leads that haven't been contacted yet
- **Contacted**: Leads that have been reached out to
- **Qualified**: Leads that meet your criteria for potential conversion
- **Converted**: Leads that have become customers
- **Avg Score**: Average lead score across all leads
- **Recent Leads**: A table showing the 5 most recently added leads

**How to use it:**
- Navigate to the Dashboard by clicking the "Dashboard" button in the navigation menu
- Use this view to get a quick snapshot of your pipeline
- Click "Edit" on any recent lead to modify its details
- Click "Delete" to remove a lead (you'll be asked to confirm)

### 2. All Leads View

The All Leads view displays a complete list of all your leads with powerful filtering and search capabilities.

**Features:**
- **Search Bar**: Type to search by name, email, or company name
- **Status Filter**: Filter leads by their current status (New, Contacted, Qualified, Converted, Lost)
- **Export CSV**: Download all your leads as a CSV file for use in other tools
- **Actions**: Edit or delete any lead directly from the list

**How to use it:**
1. Click "All Leads" in the navigation menu
2. Use the search bar to find specific leads
3. Use the status dropdown to filter by lead status
4. Click "Export CSV" to download your leads data
5. Click "Edit" to modify a lead or "Delete" to remove it

### 3. Creating a New Lead

Add new leads to your system through the intuitive lead creation form.

**How to create a lead:**
1. Click "New Lead" in the navigation menu
2. Fill out the form with lead information:
   - **Required fields** (marked with *):
     - First Name
     - Last Name
     - Email (must be unique and in valid format)
   - **Optional fields**:
     - Phone
     - Company
     - Job Title
     - Industry
     - Lead Source (Website, Referral, Social Media, Email Campaign, Event, Other)
     - Status (New, Contacted, Qualified, Converted, Lost)
     - Lead Score (0-100)
     - Notes (for any additional information)
3. Click "Create Lead" to save
4. Click "Cancel" to return to the Dashboard without saving

**Tips:**
- Email addresses must be unique; you can't create two leads with the same email
- Lead scores range from 0-100; use this to prioritize high-value leads
- Use the Notes field to record any important details about the lead

### 4. Editing a Lead

Update lead information as you progress through your sales pipeline.

**How to edit a lead:**
1. From either the Dashboard or All Leads view, click "Edit" on the lead you want to modify
2. The form will open with the lead's current information pre-filled
3. Modify any fields you want to update
4. Click "Update Lead" to save changes
5. Click "Cancel" to discard changes

**Common updates:**
- Change status as you progress (New → Contacted → Qualified → Converted)
- Increase lead score as they show more interest
- Add notes after each interaction
- Update contact information if it changes

### 5. Deleting a Lead

Remove leads that are no longer relevant.

**How to delete a lead:**
1. Click "Delete" on any lead from the Dashboard or All Leads view
2. Confirm the deletion in the popup dialog
3. The lead will be permanently removed from the system

**Warning:** Deletion is permanent and cannot be undone!

### 6. Exporting Leads

Export your leads data for use in other systems or for reporting.

**How to export:**
1. Go to the "All Leads" view
2. Apply any filters if you only want specific leads (optional)
3. Click "Export CSV"
4. A file named `leads.csv` will be downloaded to your computer
5. Open the CSV file in Excel, Google Sheets, or any spreadsheet application

**What's included in the export:**
- All lead information (name, email, phone, company, etc.)
- Lead status and score
- Creation and update timestamps
- All notes

## Lead Status Workflow

Understanding the lead status workflow helps you track progress:

1. **New**: Lead just entered the system, no contact made yet
2. **Contacted**: You've reached out to the lead
3. **Qualified**: Lead meets your criteria and shows interest
4. **Converted**: Lead has become a customer
5. **Lost**: Lead is no longer viable

**Best Practices:**
- Start all leads as "New"
- Move to "Contacted" after first touchpoint
- Mark as "Qualified" when they show genuine interest
- Change to "Converted" when they become a customer
- Use "Lost" for leads that won't convert (don't delete unless necessary)

## Lead Scoring

The lead scoring system (0-100) helps prioritize your efforts.

**Scoring Guidelines:**
- **0-25**: Cold lead, minimal engagement
- **26-50**: Warm lead, some interest shown
- **51-75**: Hot lead, actively engaged
- **76-100**: Very hot lead, likely to convert soon

**Tips for scoring:**
- Increase scores when leads engage with your content
- Consider company size, budget, and timeline in your scoring
- Regularly review and update scores based on new interactions

## Search and Filter

### Search Functionality
The search bar looks for matches in:
- First name
- Last name
- Email address
- Company name

**Tips:**
- Search is case-insensitive
- Results update automatically as you type
- Clear the search box to see all leads again

### Status Filtering
Filter leads by their current status:
- Select "All Status" to see everything
- Choose a specific status to see only those leads
- Combine with search for more precise filtering

## Tips for Success

1. **Keep Data Current**: Update lead status and scores regularly
2. **Use Notes**: Record important details after each interaction
3. **Score Consistently**: Use the same criteria for all leads
4. **Regular Reviews**: Check your dashboard daily
5. **Clean Data**: Remove or mark as "Lost" leads that aren't viable
6. **Export Often**: Back up your data by exporting regularly

## Keyboard Shortcuts

While the application doesn't have specific keyboard shortcuts, standard browser navigation works:
- `Tab`: Move between form fields
- `Enter`: Submit forms
- `Esc`: Close dialogs (in some browsers)

## Troubleshooting

### "Failed to fetch leads" error
- Ensure the backend server is running on port 3001
- Check your network connection
- Refresh the page

### Email already exists error
- Each lead must have a unique email address
- Check if the lead already exists in the system
- Use a different email or update the existing lead

### Rate limit exceeded
- The API limits you to 100 requests per 15 minutes
- Wait a few minutes before trying again
- This protection prevents abuse of the system

## Data Privacy

### What data is stored?
- All lead information you enter
- Timestamps for creation and updates
- No passwords or authentication data (in this version)

### Where is data stored?
- Locally in a SQLite database file (`backend/leads.db`)
- Not transmitted to any external services
- Remains on your local machine

## Support

For issues, questions, or feature requests:
- Check the README.md for setup instructions
- Review the API.md for technical details
- Open an issue on the GitHub repository

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Developed by:** AtlasPrime Team
