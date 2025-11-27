// Build script to generate config.js from environment variables
// This is used for Vercel deployments where config.js should not be committed

const fs = require('fs');
const path = require('path');

// Read environment variables (Vercel injects these at build time)
const config = {
  ADMIN_PASS: process.env.ADMIN_PASS,
  ATTEND_PASS: process.env.ATTEND_PASS,
  STAFF: process.env.STAFF ? JSON.parse(process.env.STAFF) : {
    '8031999': 'Bella',
    '8031555': 'Edwin',
    '8031333': 'Brandon',
    '8031777': 'Tandin'
  },
  WORKSTATIONS: process.env.WORKSTATIONS ? JSON.parse(process.env.WORKSTATIONS) : [1, 2, 3, 4, 5, 6, 15, 16, 17, 18, 19, 20],
  GOOGLE_SHEETS: {
    VALIDATION_SHEET_ID: process.env.VALIDATION_SHEET_ID || '',
    VALIDATION_SHEET_NAME: process.env.VALIDATION_SHEET_NAME || 'Sheet1',
    REGISTRATION_SHEET_ID: process.env.REGISTRATION_SHEET_ID || '',
    REGISTRATION_SHEET_NAME: process.env.REGISTRATION_SHEET_NAME || 'Sheet1',
    SESSIONS_SHEET_ID: process.env.SESSIONS_SHEET_ID || '',
    SESSIONS_SHEET_NAME: process.env.SESSIONS_SHEET_NAME || 'Sheet1',
    API_URL: process.env.API_URL || ''
  }
};

// Generate config.js content
const configContent = `// Steamoji Workshop Registration Tool Configuration
// This file is auto-generated from environment variables during Vercel build
// DO NOT EDIT MANUALLY - it will be overwritten on each deployment

window.WORKSHOP_CONFIG = ${JSON.stringify(config, null, 2)};
`;

// Write config.js file
const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ config.js generated successfully from environment variables');
console.log('📝 Configuration loaded:');
console.log(`   - Admin Pass: ${config.ADMIN_PASS ? '***' : 'NOT SET'}`);
console.log(`   - API URL: ${config.GOOGLE_SHEETS.API_URL ? 'SET' : 'NOT SET'}`);
console.log(`   - Validation Sheet ID: ${config.GOOGLE_SHEETS.VALIDATION_SHEET_ID ? 'SET' : 'NOT SET'}`);
console.log(`   - Registration Sheet ID: ${config.GOOGLE_SHEETS.REGISTRATION_SHEET_ID ? 'SET' : 'NOT SET'}`);
console.log(`   - Sessions Sheet ID: ${config.GOOGLE_SHEETS.SESSIONS_SHEET_ID ? 'SET' : 'NOT SET'}`);

