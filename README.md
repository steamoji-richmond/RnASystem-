# Steamoji Workshop Registration Tool

> A professional, mobile-friendly workshop registration and attendance management system with Google Sheets integration and QR code badge scanning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-blue.svg)](https://developer.mozilla.org/en-US/docs/Web)
[![Deploy: Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Google Sheets Setup](#google-sheets-setup)
- [Google Apps Script Setup](#google-apps-script-setup)
- [Usage](#usage)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## Overview

The Steamoji Workshop Registration Tool is a comprehensive web-based system designed for managing workshop registrations and attendance tracking. It integrates seamlessly with Google Sheets for data persistence and provides a user-friendly interface for both administrators and participants.

### Key Capabilities

- **Email-based registration** for participants
- **Real-time attendance tracking** via QR code scanning
- **Session management** with capacity limits
- **Google Sheets integration** for data storage and backup
- **Mobile-responsive design** for on-the-go access
- **Admin dashboard** for comprehensive management

## Features

### Core Functionality

- ✅ **Email-Based Registration**: Register participants using parent email addresses
- ✅ **Member Validation**: Automatic validation against Google Sheets database
- ✅ **Multiple Member Support**: Handle multiple children per email address
- ✅ **Session Management**: Create, edit, and delete workshop sessions
- ✅ **Capacity Management**: Automatic capacity tracking (max 10 participants per session)
- ✅ **Monthly Registration Limits**: One session per month per user

### Attendance & Tracking

- ✅ **QR Code Scanning**: Scan badges to check in/out participants
- ✅ **Seat Assignment**: Automatic workstation assignment
- ✅ **Check-in/Check-out**: Track participant arrival and departure times
- ✅ **Distance Detection**: Real-time feedback for optimal QR code scanning distance

### Administrative Features

- ✅ **Admin Panel**: Password-protected administrative interface
- ✅ **Manual Registration**: Register users manually with staff authentication
- ✅ **Session Bulk Creation**: Automatically generate sessions for all Sundays in a month
- ✅ **Data Export**: Export registrations and attendance data
- ✅ **Parent Confirmation**: Generate printable confirmation documents

### Technical Features

- ✅ **Google Sheets Sync**: Real-time synchronization with Google Sheets
- ✅ **Offline Support**: Local storage fallback for offline functionality
- ✅ **URL Routing**: Clean URL-based navigation (`/attendance`, `/admin`)
- ✅ **Mobile-Friendly**: Fully responsive design for all devices
- ✅ **Cross-Platform**: Works on desktop, tablet, and mobile devices

## Prerequisites

Before you begin, ensure you have the following:

- **Web Browser**: Modern browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)
- **Google Account**: For Google Sheets and Google Apps Script access
- **Python 3.x** (optional): For local development server
- **Node.js 14+** (optional): For Vercel deployment with environment variables
- **Git** (optional): For version control and deployment

## Quick Start

### 1. Clone or Download the Repository

```bash
git clone <repository-url>
cd attandance-system
```

### 2. Set Up Configuration

```bash
# Copy the example configuration file
cp config.example.js config.js

# Edit config.js with your settings
# See Configuration section for details
```

### 3. Configure Google Sheets

1. Create three Google Sheets (see [Google Sheets Setup](#google-sheets-setup))
2. Set up Google Apps Script (see [Google Apps Script Setup](#google-apps-script-setup))
3. Update `config.js` with your Sheet IDs and API URL

### 4. Run Locally

```bash
# Start a local web server
python -m http.server 8000

# Open in browser
# http://localhost:8000/Public Speaking Workshop Registration Tool.html
```

## Configuration

### Configuration File Structure

All sensitive configuration is stored in `config.js`. This file should **NOT** be committed to version control.

### Initial Setup

1. **Copy the example configuration**:
   ```bash
   cp config.example.js config.js
   ```

2. **Edit `config.js`** with your settings:
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

### Security Best Practices

- ⚠️ **Never commit `config.js`** with real passwords to version control
- ✅ Add `config.js` to your `.gitignore` file
- ✅ Use strong, unique passwords in production
- ✅ Change default passwords before deploying
- ✅ Use environment variables for production deployments (see [Deployment](#deployment))

## Google Sheets Setup

The system requires three Google Sheets for data storage. Each sheet serves a specific purpose:

### 1. Validation Sheet

**Purpose**: Member database for validation during registration

**Required Columns**:
- `firstName` - Member's first name
- `lastName` - Member's last name
- `familyRole` - Family role (e.g., SON, DAUGHTER)
- `age` - Member's age
- `house` - House assignment
- `level` - Skill level
- `school` - School name
- `parent` - Parent name
- `parentEmail` - Parent email address
- `badgeId` - Unique badge identifier (auto-created if missing)

**Usage**: Used to verify if a member exists when they register for a session.

### 2. Registration Sheet

**Purpose**: Store all workshop registrations

**Required Columns** (auto-created if empty):
- `id` - Unique registration ID
- `badgeId` - Badge identifier
- `firstName` - Member's first name
- `lastName` - Member's last name
- `familyRole` - Family role
- `age` - Member's age
- `house` - House assignment
- `level` - Skill level
- `school` - School name
- `parent` - Parent name
- `parentEmail` - Parent email address
- `sessionId` - Associated session ID
- `sessionDate` - Session date
- `sessionTime` - Session time
- `sessionTopic` - Session topic
- `registeredBy` - Staff member who registered
- `registeredDateAndTime` - Registration timestamp

### 3. Sessions Sheet

**Purpose**: Store workshop session information

**Required Columns** (auto-created if empty):
- `id` - Unique session ID
- `dt` - Date and time (ISO format)
- `topic` - Session topic
- `capacity` - Maximum participants
- `reg` - Registration IDs (JSON array)
- `att` - Attendance records (JSON array)

**Note**: `reg` and `att` are stored as JSON arrays containing registration and attendance data.

## Google Apps Script Setup

The system uses Google Apps Script as a backend API for Google Sheets operations.

### Step 1: Create Google Apps Script Project

1. Navigate to [Google Apps Script](https://script.google.com)
2. Click **"New Project"**
3. Paste the code from `GoogleAppsScript.gs`

### Step 2: Configure Sheet IDs

Update the Sheet IDs in the script:

```javascript
var VALIDATION_SHEET_ID = 'your-validation-sheet-id';
var REGISTRATION_SHEET_ID = 'your-registration-sheet-id';
var SESSIONS_SHEET_ID = 'your-sessions-sheet-id';
```

**How to find Sheet IDs**: Extract from the Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

### Step 3: Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Select **"Web app"** as the type
3. Configure settings:
   - **Execute as**: Me
   - **Who has access**: Anyone (required for CORS)
4. Click **"Deploy"**
5. Copy the **Web App URL**

### Step 4: Update Configuration

Add the Web App URL to `config.js`:

```javascript
GOOGLE_SHEETS: {
  API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
}
```

### Important Notes

- ⚠️ After making code changes, you **must redeploy** the Web App
- ⚠️ CORS headers are automatically added when deployed with "Anyone" access
- ⚠️ The URL must end with `/exec` (not `/dev`)

## Usage

### Running Locally

#### Using Python HTTP Server (Recommended)

```bash
# Navigate to project directory
cd "path/to/attandance-system"

# Start server (Python 3)
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Access in browser
# http://localhost:8000/Public Speaking Workshop Registration Tool.html
```

#### URL Routing (Local Development)

The application uses hash-based routing for local development:

- **Register**: `http://localhost:8000/Public Speaking Workshop Registration Tool.html#register`
- **Attendance**: `http://localhost:8000/Public Speaking Workshop Registration Tool.html#attendance`
- **Admin**: `http://localhost:8000/Public Speaking Workshop Registration Tool.html#admin`

### User Registration Flow

1. **Enter Parent Email**: User enters their email address
2. **Member Selection**: System displays all members associated with that email
3. **Session Selection**: User selects a member and views eligible sessions
4. **Registration**: User registers for a session (max 10 per session, one per month)
5. **Confirmation**: Registration is saved to Google Sheets

### Admin Registration Flow

1. **Access Admin Panel**: Navigate to Admin page (password required)
2. **Manual Registration**: Use the manual registration form
3. **Staff Authentication**: Enter staff authentication code
4. **Complete Registration**: Registration is saved with staff name as "RegisteredBy"

### Session Management

#### Creating Sessions

- **Bulk Creation**: Use "Bulk create Sundays" to generate all Sundays in a month
- **Individual Creation**: Use "Add one session" for custom sessions
- All sessions are automatically saved to Google Sheets

#### Managing Sessions

- **View**: All sessions displayed in Session Management table
- **Edit**: Click edit to modify date, time, topic, or capacity
- **Delete**: Delete sessions (also removes associated registrations)
- **Sync**: All changes automatically sync to Google Sheets

### Attendance Tracking

#### Check-In Process

1. **Select Session**: Choose a session from the attendance page
2. **Start Camera**: Click "Start Camera" to begin QR scanning
3. **Scan Badge**: Hold badge in front of camera
4. **Automatic Assignment**: System assigns seat and records check-in time
5. **Confirmation**: Seat number displayed to user

#### Check-Out Process

1. **Scan Again**: Scan the same badge to check out
2. **Record Time**: System records check-out time
3. **Confirmation**: User receives check-out confirmation

#### First-Time Users

If a badge is not found in the system:
1. **Registration Form**: User fills out registration form
2. **Badge Assignment**: Badge ID is saved to validation sheet
3. **Registration Update**: All existing registrations for that user are updated with badge ID
4. **Check-In**: User can then check in normally

## Deployment

### Deploying to Vercel

Vercel provides free hosting with automatic deployments from Git repositories.

#### Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account ([sign up here](https://vercel.com))

#### Method 1: Vercel Dashboard (Recommended)

1. **Create Vercel Account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Import your Git repository
   - Select the repository

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - **Build Command**: 
     - Option C: `npm run build`
     - Options A/B: Leave empty
   - **Output Directory**: `.` (or leave empty)
   - **Install Command**: 
     - Option C: `npm install`
     - Options A/B: Leave empty

4. **Handle Configuration** (Choose one method):

   **Option A: Commit config.js** (Simplest)
   - Temporarily remove `config.js` from `.gitignore`
   - Commit and push `config.js`
   - Deploy to Vercel
   - ⚠️ Note: Config will be public in Git

   **Option B: Use config.example.js**
   - Copy `config.example.js` to `config.js`
   - Fill in your values
   - Commit `config.js` to Git
   - Deploy to Vercel

   **Option C: Environment Variables** (Recommended for Production)
   - See [Environment Variables Setup](#option-c-environment-variables) below

5. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment (1-2 minutes)

6. **Access Your Site**
   - Production URL: `https://your-project.vercel.app`
   - Register: `https://your-project.vercel.app/`
   - Attendance: `https://your-project.vercel.app/attendance`
   - Admin: `https://your-project.vercel.app/admin`

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to project
cd "path/to/attandance-system"

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option C: Environment Variables (Recommended)

This method keeps secrets out of Git by using Vercel's environment variables.

1. **Set Environment Variables in Vercel**
   - Go to **Settings** → **Environment Variables**
   - Add variables for Production, Preview, and Development:

   **Required Variables**:
   ```
   ADMIN_PASS=your-admin-password
   ATTEND_PASS=your-attendance-password
   API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   VALIDATION_SHEET_ID=your-validation-sheet-id
   REGISTRATION_SHEET_ID=your-registration-sheet-id
   SESSIONS_SHEET_ID=your-sessions-sheet-id
   ```

   **Optional Variables** (with defaults):
   ```
   VALIDATION_SHEET_NAME=Sheet1
   REGISTRATION_SHEET_NAME=Sheet1
   SESSIONS_SHEET_NAME=Sheet1
   STAFF={"8031999":"Bella","8031555":"Edwin","8031333":"Brandon","8031777":"Tandin"}
   WORKSTATIONS=[1,2,3,4,5,6,15,16,17,18,19,20]
   ```

2. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

3. **Deploy**
   - The build script automatically generates `config.js` from environment variables
   - Check build logs for: `✅ config.js generated successfully`

**Benefits**:
- ✅ Secrets stored securely in Vercel (not in Git)
- ✅ `config.js` stays in `.gitignore`
- ✅ Easy to update without code changes
- ✅ Different values per environment

### Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

## Architecture

### File Structure

```
.
├── Public Speaking Workshop Registration Tool.html  # Main application
├── config.js                                        # Configuration (gitignored)
├── config.example.js                                # Configuration template
├── build-config.js                                  # Build script (Option C)
├── package.json                                     # Node.js package file
├── GoogleAppsScript.gs                              # Backend API code
├── vercel.json                                      # Vercel configuration
├── README.md                                        # Documentation
└── .gitignore                                       # Git ignore rules
```

### Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Google Apps Script
- **Storage**: Google Sheets
- **QR Scanning**: Native BarcodeDetector API with jsQR fallback
- **Deployment**: Vercel (or any static hosting)

### Data Flow

1. **User Action** → Frontend (HTML/JS)
2. **API Call** → Google Apps Script (Web App)
3. **Data Operation** → Google Sheets
4. **Response** → Frontend
5. **UI Update** → User sees result

## Troubleshooting

### Common Issues

#### Sessions Not Loading

**Symptoms**: Sessions don't appear in admin or attendance pages

**Solutions**:
- Verify `SESSIONS_SHEET_ID` is correct in `config.js` and `GoogleAppsScript.gs`
- Check Google Apps Script is deployed and accessible
- Review browser console for errors
- Ensure sheet has proper permissions

#### Registrations Not Saving

**Symptoms**: Registration appears to save but doesn't persist

**Solutions**:
- Verify `REGISTRATION_SHEET_ID` is correct
- Check Google Apps Script deployment settings (must be "Anyone")
- Ensure sheet has write permissions
- Check browser console for API errors

#### API Errors / CORS Issues

**Symptoms**: Network errors or CORS policy violations

**Solutions**:
- Verify Web App URL in `config.js` matches deployed script
- Ensure script is deployed with "Execute as: Me" and "Who has access: Anyone"
- Redeploy the script after making changes
- Check that URL ends with `/exec` (not `/dev`)

#### QR Code Not Scanning

**Symptoms**: Camera opens but doesn't detect QR codes

**Solutions**:
- Ensure HTTPS or localhost (required for camera access)
- Check browser permissions for camera access
- Verify QR code is clear and properly lit
- Check browser console for errors
- Try moving closer/farther from QR code (distance warnings should appear)

#### Config Not Working (Vercel)

**Symptoms**: Application loads but configuration is missing

**Solutions**:
- **Option A/B**: Ensure `config.js` is committed to Git
- **Option C**: 
  - Verify all environment variables are set in Vercel
  - Check build command is `npm run build`
  - Review build logs for `config.js` generation
  - Ensure `package.json` and `build-config.js` are in Git

#### Build Errors (Vercel)

**Symptoms**: Deployment fails during build

**Solutions**:
- Verify `package.json` exists and has build script
- Check `build-config.js` is committed to Git
- Ensure Node.js is available (Vercel supports by default)
- Review Vercel build logs for specific errors

#### Environment Variables Not Working

**Symptoms**: Variables set but not being used

**Solutions**:
- Ensure variables are set for correct environment (Production/Preview/Development)
- Verify JSON strings (STAFF, WORKSTATIONS) are properly formatted
- Check variable names match exactly (case-sensitive)
- Redeploy after adding/changing variables

### Getting Help

1. **Check Browser Console**: Open DevTools (F12) and check for errors
2. **Review Build Logs**: Check Vercel deployment logs for build errors
3. **Verify Configuration**: Double-check all IDs and URLs in `config.js`
4. **Test API**: Verify Google Apps Script Web App is accessible

## Support

For additional support:

- **Browser Console**: Check for JavaScript errors and warnings
- **Network Tab**: Verify API calls are successful
- **Configuration**: Ensure all settings are correct
- **Documentation**: Review this README for detailed instructions

---

**License**: MIT  
**Version**: 1.0.0  
**Maintained by**: Steamoji Development Team
