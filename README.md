# Steamoji Workshop Registration Tool

A professional, mobile-friendly workshop registration and attendance system with email-based registration and Google Sheets integration.

## Features

- **Email-Based Registration**: Register participants using parent email address
- **Google Sheets Integration**: Automatically saves registrations and sessions to Google Sheets
- **Member Validation**: Validates members against Google Sheets database
- **Multiple Member Support**: Handles multiple children per email address
- **Session Management**: Create, edit, and delete sessions with Google Sheets sync
- **Manual Registration**: Admin can manually register users (password protected)
- **Attendance Tracking**: Scan badges to check in participants and assign seats
- **Admin Panel**: Manage sessions, users, and export data
- **Mobile-Friendly**: Fully responsive design for mobile devices
- **Offline Support**: Works with local storage as fallback

## Configuration

### Setting Up Passwords and Configuration

All sensitive configuration is stored in `config.js`. This file should **NOT** be committed to version control.

1. **Copy `config.example.js` to `config.js`**:
   ```bash
   cp config.example.js config.js
   ```

2. **Edit `config.js`** with your actual passwords and settings:
   ```javascript
   window.WORKSHOP_CONFIG = {
     ADMIN_PASS: 'your-admin-password',
     ATTEND_PASS: 'your-attendance-password',
     STAFF: {
       'CODE1': 'Staff Name 1',
       'CODE2': 'Staff Name 2'
     },
     WORKSTATIONS: [1, 2, 3, 4, 5, 6, 15, 16, 17, 18, 19, 20],
     GOOGLE_SHEETS: {
       VALIDATION_SHEET_ID: 'your-validation-sheet-id',
       VALIDATION_SHEET_NAME: 'Sheet1',
       REGISTRATION_SHEET_ID: 'your-registration-sheet-id',
       REGISTRATION_SHEET_NAME: 'Sheet1',
       SESSIONS_SHEET_ID: 'your-sessions-sheet-id',
       SESSIONS_SHEET_NAME: 'Sheet1',
       API_URL: 'your-google-apps-script-web-app-url'
     }
   };
   ```

### Google Sheets Setup

You need to create **three Google Sheets**:

1. **Validation Sheet**: Contains member data to validate against
   - Columns: `firstName`, `lastName`, `familyRole`, `age`, `house`, `level`, `school`, `parent`, `parentEmail`, `badgeId`
   - Used to verify if a member exists when they register

2. **Registration Sheet**: Where registrations are saved
   - Columns: `badgeId`, `firstName`, `lastName`, `familyRole`, `age`, `house`, `level`, `school`, `parent`, `parentEmail`, `sessionId`, `sessionDate`, `sessionTime`, `sessionTopic`, `registeredBy`, `registeredDateAndTime`
   - Automatically created with headers if empty

3. **Sessions Sheet**: Where workshop sessions are stored
   - Columns: `id`, `dt`, `topic`, `capacity`, `reg`, `att`
   - Automatically created with headers if empty
   - `reg` and `att` are stored as JSON arrays

### Setting Up Google Apps Script

1. **Open Google Apps Script**: https://script.google.com

2. **Create a new project** and paste the code from `GoogleAppsScript.gs`

3. **Update the Sheet IDs** in the script:
   ```javascript
   var VALIDATION_SHEET_ID = 'your-validation-sheet-id';
   var REGISTRATION_SHEET_ID = 'your-registration-sheet-id';
   var SESSIONS_SHEET_ID = 'your-sessions-sheet-id';
   ```

4. **Deploy as Web App**:
   - Click "Deploy" > "New deployment"
   - Choose type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the Web App URL

5. **Update `config.js`**:
   - Add the Web App URL to `GOOGLE_SHEETS.API_URL`
   - Add your sheet IDs to the respective fields

### Setting Up Passwords

1. **Edit `config.js`** with your actual passwords:
   ```javascript
   ADMIN_PASS: 'your-admin-password',
   ATTEND_PASS: 'your-attendance-password',
   ```

2. **Default Configuration** (for reference):
   - Admin Password: `8031`
   - Attendance Password: `8031`
   - Staff Codes: `8031999` (Bella), `8031555` (Edwin), `8031333` (Brandon), `8031777` (Tandin)
   - Workstations: `[1,2,3,4,5,6,15,16,17,18,19,20]`

### Security Notes

- ⚠️ **Never commit `config.js` with real passwords to version control**
- ✅ Add `config.js` to your `.gitignore` file
- ✅ Use strong, unique passwords in production
- ✅ Change default passwords before deploying

## Usage

### Running with Python (Recommended)

To avoid CORS issues, run the HTML file using a local web server instead of opening it directly:

1. **Open a terminal/command prompt** in the project directory:
   ```bash
   cd "C:\Users\TandinW\Downloads\attandance system"
   ```

2. **Start Python HTTP server**:
   
   **Python 3** (most common):
   ```bash
   python -m http.server 8000
   ```
   
   **Python 2** (if Python 3 is not available):
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. **Open in browser**:
   - Navigate to: `http://localhost:8000/Public Speaking Workshop Registration Tool.html`
   - Or: `http://localhost:8000/` and click on the HTML file

4. **Stop the server**: Press `Ctrl+C` in the terminal when done

### URL Routing

The application uses URL-based routing for navigation. The default page is the Register page.

#### With Python Server (Local Development)

When running with Python's HTTP server, use **hash-based routing**:

- **Register page** (default): 
  ```
  http://localhost:8000/Public Speaking Workshop Registration Tool.html
  ```
  or
  ```
  http://localhost:8000/Public Speaking Workshop Registration Tool.html#register
  ```

- **Attendance page**: 
  ```
  http://localhost:8000/Public Speaking Workshop Registration Tool.html#attendance
  ```

- **Admin page**: 
  ```
  http://localhost:8000/Public Speaking Workshop Registration Tool.html#admin
  ```

#### With Vercel (Production Deployment)

When deployed to Vercel, use **path-based routing**:

- **Register page** (default): 
  ```
  https://your-site.vercel.app/
  ```
  or
  ```
  https://your-site.vercel.app/register
  ```

- **Attendance page**: 
  ```
  https://your-site.vercel.app/attendance
  ```

- **Admin page**: 
  ```
  https://your-site.vercel.app/admin
  ```

**Note**: The `vercel.json` configuration file handles client-side routing automatically. The application detects the environment and uses the appropriate routing method.

### Running Directly (Not Recommended)

⚠️ **Note**: Opening the HTML file directly (`file://`) may cause CORS errors when accessing Google Sheets API. Use a local web server instead.

1. **Open `Public Speaking Workshop Registration Tool.html`** in a web browser
2. The system will automatically load configuration from `config.js`
3. If `config.js` is missing, it will use default values (not recommended for production)

### Registration Flow

1. **User Registration**:
   - Enter parent email address
   - System searches Google Sheets for members associated with that email
   - Select a member to register
   - View eligible sessions (max 10 per session, one session per month per user)
   - Register for a session
   - Registration is saved to Google Sheets

2. **Admin Registration**:
   - Go to Admin tab (requires admin password)
   - Use manual registration form
   - Enter staff authentication code
   - Registration is saved to Google Sheets with staff name as "RegisteredBy"

### Session Management

1. **Creating Sessions**:
   - Go to Admin tab
   - Use "Bulk create Sundays" to automatically create sessions for all Sundays in a month
   - Or use "Add one session" to create individual sessions
   - Sessions are automatically saved to Google Sheets

2. **Managing Sessions**:
   - View all sessions in the Session Management table
   - Edit sessions (date, time, topic, capacity)
   - Delete sessions
   - All changes sync to Google Sheets

3. **Session Rules**:
   - Maximum 10 participants per session
   - Each user can register for only one session per month
   - Sessions are stored in Google Sheets and loaded on admin page open

## Features

- **QR Code Scanning**: Scan badges for attendance (requires camera access)
- **Manual Registration**: Register users manually with password protection
- **Attendance Tracking**: Scan badges to check in participants and assign seats
- **Admin Panel**: Manage sessions, users, and export data
- **Mobile-Friendly**: Fully responsive design for mobile devices
- **Google Sheets Sync**: All data syncs with Google Sheets for backup and sharing

## Browser Requirements

- Modern browser with camera access support (for QR scanning)
- JavaScript enabled
- HTTPS or localhost for camera access (required for security)

## File Structure

```
.
├── Public Speaking Workshop Registration Tool.html  # Main application
├── config.js                                        # Configuration (DO NOT COMMIT)
├── config.example.js                                # Configuration template
├── GoogleAppsScript.gs                              # Google Apps Script code
├── vercel.json                                      # Vercel deployment configuration
├── README.md                                        # This file
└── .gitignore                                       # Git ignore file
```

## Google Sheets Structure

### Validation Sheet
- **Purpose**: Member database for validation
- **Columns**: `firstName`, `lastName`, `familyRole`, `age`, `house`, `level`, `school`, `parent`, `parentEmail`, `badgeId`

### Registration Sheet
- **Purpose**: Store all registrations
- **Columns**: `badgeId`, `firstName`, `lastName`, `familyRole`, `age`, `house`, `level`, `school`, `parent`, `parentEmail`, `sessionId`, `sessionDate`, `sessionTime`, `sessionTopic`, `registeredBy`, `registeredDateAndTime`
- **Auto-created**: Headers are automatically created if sheet is empty

### Sessions Sheet
- **Purpose**: Store workshop sessions
- **Columns**: `id`, `dt`, `topic`, `capacity`, `reg`, `att`
- **Auto-created**: Headers are automatically created if sheet is empty
- **Note**: `reg` and `att` are JSON arrays stored as strings

## Troubleshooting

### Sessions not loading
- Check that `SESSIONS_SHEET_ID` is correct in both `config.js` and `GoogleAppsScript.gs`
- Verify the Google Apps Script is deployed and accessible
- Check browser console for errors

### Registrations not saving
- Verify `REGISTRATION_SHEET_ID` is correct
- Check Google Apps Script deployment settings (must be "Anyone")
- Ensure the sheet has write permissions

### API errors
- Verify the Web App URL in `config.js` matches the deployed script
- Check that the script is deployed with "Execute as: Me" and "Who has access: Anyone"
- Redeploy the script if you've made changes

## Deployment

### Deploying to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from project directory**:
   ```bash
   vercel
   ```

3. **The `vercel.json` file** automatically handles:
   - Client-side routing (all routes redirect to the HTML file)
   - Proper caching headers
   - Path-based routing support

4. **After deployment**, access your site:
   - Register: `https://your-site.vercel.app/`
   - Attendance: `https://your-site.vercel.app/attendance`
   - Admin: `https://your-site.vercel.app/admin`

## Support

For issues or questions, check the browser console for error messages and verify all configuration settings are correct.
