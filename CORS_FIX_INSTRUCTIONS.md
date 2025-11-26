# CORS Error Fix Instructions

## The Problem
You're seeing this error:
```
Access to fetch at '...' from origin 'null' has been blocked by CORS policy
```

This happens because:
1. You're opening the HTML file directly from your computer (`file://` protocol)
2. Google Apps Script Web Apps have restrictions on CORS from `null` origin

## Solution 1: Redeploy Your Google Apps Script (REQUIRED)

After updating the Google Apps Script code with CORS support:

1. Go to https://script.google.com
2. Open your project
3. Click **"Deploy"** > **"Manage deployments"**
4. Click the **pencil icon** (✏️) next to your deployment
5. Click **"Deploy"** again (even without changing any settings)
6. This ensures the latest code with CORS support is active

**IMPORTANT:** You must redeploy after every code change for it to take effect!

## Solution 2: Use a Local Web Server (RECOMMENDED)

Instead of opening the HTML file directly, use a local web server:

### Option A: Python (if installed)
```bash
# Navigate to the folder containing the HTML file
cd "C:\Users\TandinW\Downloads\attandance system"

# Python 3
python -m http.server 8000

# Then open: http://localhost:8000/Public Speaking Workshop Registration Tool.html
```

### Option B: Node.js (if installed)
```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to the folder
cd "C:\Users\TandinW\Downloads\attandance system"

# Start server
http-server -p 8000

# Then open: http://localhost:8000/Public Speaking Workshop Registration Tool.html
```

### Option C: VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click on the HTML file
3. Select "Open with Live Server"

### Option D: Simple HTTP Server (Windows)
Download and use a simple HTTP server tool like:
- [HFS (HTTP File Server)](http://www.rejetto.com/hfs/)
- Or any other local web server

## Solution 3: Host on a Web Server

Upload your HTML file to a web server (GitHub Pages, Netlify, etc.) and access it via `https://` instead of `file://`.

## Verification

After redeploying and using a web server:
1. Open the browser console (F12)
2. Try creating a session
3. You should see successful API calls without CORS errors

## Troubleshooting

If CORS errors persist:
1. ✅ Make sure you redeployed the Google Apps Script Web App
2. ✅ Make sure "Who has access" is set to "Anyone" in deployment settings
3. ✅ Make sure you're using a web server (not `file://`)
4. ✅ Check the browser console for detailed error messages
5. ✅ Verify the API_URL in config.js matches your deployed Web App URL

