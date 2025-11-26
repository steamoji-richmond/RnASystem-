/**
 * Google Apps Script for Steamoji Workshop Registration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script: https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Update the SHEET_IDS below with your actual Google Sheet IDs
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Choose type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (IMPORTANT for CORS to work)
 *    - Click "Deploy"
 *    - Copy the Web App URL and paste it into config.js as API_URL
 * 
 * IMPORTANT - CORS FIX:
 * - After making any code changes, you MUST redeploy the Web App
 * - Go to "Deploy" > "Manage deployments"
 * - Click the pencil icon to edit
 * - Click "Deploy" again (even without changing settings)
 * - This ensures the latest code with CORS support is active
 * 
 * NOTE: If you're running the HTML file from file:// (local file),
 * CORS may still fail. Consider:
 * - Using a local web server (e.g., Python: python -m http.server)
 * - Or hosting the HTML file on a web server
 * 
 * SHEET STRUCTURE:
 * 
 * Validation Sheet columns (Sheet1):
 * firstName | lastName | familyRole | age | house | level | school | parent | parentEmail
 * 
 * Registration Sheet columns (Sheet1):
 * badgeId | firstName | lastName | familyRole | age | house | level | school | parent | parentEmail | registeredDateAndTime
 */

// UPDATE THESE WITH YOUR GOOGLE SHEET IDs
// Get the ID from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
var VALIDATION_SHEET_ID = '120qZboQP9V6RP9oZ3fbBiMHUZI5l4FOEGGeok2VLAzM';
var REGISTRATION_SHEET_ID = '1DsIyfQiAzYcn_XDG5EcMGImAIbAuSQzWdGU45x-meSw';
var SESSIONS_SHEET_ID = '1pLDhPV0agDJPwtNK-CHutp6XBHVpQcDoPiVzivAFJhA';

// Sheet tab names
var VALIDATION_SHEET_NAME = 'Sheet1';
var REGISTRATION_SHEET_NAME = 'Sheet1';
var SESSIONS_SHEET_NAME = 'Sheet1';

/**
 * Helper function to create JSON response
 * Google Apps Script Web Apps automatically add CORS headers when deployed
 * with "Who has access: Anyone"
 */
function createCorsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET requests with CORS support
 * Also handles OPTIONS preflight requests
 */
function doGet(e) {
  // Handle OPTIONS preflight request
  if (e.parameter && e.parameter.requestMethod === 'OPTIONS') {
    return createCorsResponse({ success: true });
  }
  
  var action = e.parameter.action;
  var result;
  
  if (action === 'lookup') {
    result = lookupByEmailData(e.parameter.email);
  } else if (action === 'getRegistrations') {
    result = getRegistrationsData();
  } else if (action === 'getSessions') {
    result = getSessionsData();
  } else if (action === 'getValidation') {
    result = getValidationData();
  } else {
    result = {
      success: false,
      error: 'Invalid action'
    };
  }
  
  // Return JSON response with CORS support
  return createCorsResponse(result);
}

/**
 * Handle POST requests with CORS support
 * 
 * IMPORTANT: Google Apps Script Web Apps automatically add CORS headers
 * (Access-Control-Allow-Origin: *) when deployed with "Who has access: Anyone"
 * 
 * However, OPTIONS preflight requests are handled automatically by Google's infrastructure.
 * If you're still seeing CORS errors:
 * 1. Ensure Web App is deployed with "Who has access: Anyone"
 * 2. Redeploy after any code changes
 * 3. Make sure the URL ends with /exec (not /dev)
 */
function doPost(e) {
  try {
    var action = "";
    
    // 1️⃣ Read action from URL (?action=saveSession)
    // Google Apps Script automatically decodes URL parameters, but let's be explicit
    if (e.parameter && e.parameter.action) {
      action = String(e.parameter.action).trim();
      // Handle URL encoding if needed (though GAS should auto-decode)
      try {
        action = decodeURIComponent(action);
      } catch (err) {
        // If already decoded, ignore error
      }
    }
    
    var data = {};
    
    // 2️⃣ Read and parse JSON body safely
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        return createCorsResponse({
          success: false,
          error: "Invalid JSON: " + err.toString()
        });
      }
      
      // If action not in URL, use body.action
      if (!action && data.action) {
        action = String(data.action).trim();
      }
    }
    
    // Also check for sessionId in URL parameters (for deleteSession)
    if (e.parameter && e.parameter.sessionId && !data.sessionId) {
      data.sessionId = String(e.parameter.sessionId).trim();
    }
    
    if (!action) {
      return createCorsResponse({
        success: false,
        error: "Missing action. Use ?action=saveSession or ?action=deleteSession"
      });
    }
    
    var result;
    
    // 3️⃣ Route the action
    switch (action) {
      case "saveSession":
        result = saveSessionData(data);
        break;
      case "register":
        result = saveRegistrationData(data);
        break;
      case "deleteSession":
        // For deleteSession, check both URL parameter and body for sessionId
        var sessionId = data.sessionId || (e.parameter && e.parameter.sessionId) || '';
        if (!sessionId) {
          result = {
            success: false,
            error: "Session ID is required for deleteSession"
          };
        } else {
          result = deleteSessionData(sessionId);
        }
        break;
      case "saveAllSessions":
        result = saveAllSessionsData(data.sessions);
        break;
      case "updateValidation":
        result = updateValidationData(data);
        break;
      case "deleteValidation":
        var rowIndex = data.rowIndex || (e.parameter && e.parameter.rowIndex) || '';
        if (!rowIndex) {
          result = {
            success: false,
            error: "Row index is required for deleteValidation"
          };
        } else {
          result = deleteValidationData(rowIndex);
        }
        break;
      case "updateRegistration":
        result = updateRegistrationData(data);
        break;
      case "updateAllRegistrationsForUser":
        result = updateAllRegistrationsForUser(data);
        break;
      default:
        result = {
          success: false,
          error: "Invalid action: '" + action + "'. Valid actions: saveSession, register, deleteSession, saveAllSessions, updateValidation, deleteValidation, updateRegistration, updateAllRegistrationsForUser"
        };
    }
    
    return createCorsResponse(result);
  } catch (err) {
    return createCorsResponse({
      success: false,
      error: "doPost error: " + err.toString()
    });
  }
}

/**
 * Lookup members by parent email (returns data object, not ContentService output)
 */
function lookupByEmailData(email) {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Email parameter is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(VALIDATION_SHEET_ID).getSheetByName(VALIDATION_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: true,
        members: []
      };
    }
    
    // Get headers (first row)
    var headers = data[0];
    var emailColIndex = headers.indexOf('parentEmail');
    
    if (emailColIndex === -1) {
      return {
        success: false,
        error: 'parentEmail column not found in validation sheet'
      };
    }
    
    // Find all rows matching the email (case-insensitive)
    var members = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowEmail = (row[emailColIndex] || '').toString().toLowerCase().trim();
      
      if (rowEmail === email.toLowerCase().trim()) {
        var member = {};
        headers.forEach(function(header, index) {
          var headerKey = header.toString().trim();
          member[headerKey] = row[index] || '';
        });
        // Ensure camelCase fields exist
        member.firstName = member.firstName || member['First Name'] || '';
        member.lastName = member.lastName || member['Last Name'] || '';
        member.badgeId = member.badgeId || member['Badge ID'] || member['badgeId'] || '';
        member.familyRole = member.familyRole || member['Family Role'] || '';
        member.age = member.age || member['Age'] || '';
        member.house = member.house || member['House'] || '';
        member.level = member.level || member['Level'] || '';
        member.school = member.school || member['School'] || '';
        member.parent = member.parent || member['Parent'] || '';
        member.parentEmail = member.parentEmail || member['Parent Email'] || email;
        members.push(member);
      }
    }
    
    return {
      success: true,
      members: members
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Get all registrations from Google Sheets
 */
function getRegistrationsData() {
  try {
    var sheet = SpreadsheetApp.openById(REGISTRATION_SHEET_ID).getSheetByName(REGISTRATION_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: true,
        registrations: []
      };
    }
    
    // Get headers (first row)
    var headers = data[0];
    
    // Convert rows to objects
    var registrations = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var reg = {};
      headers.forEach(function(header, index) {
        var headerKey = header.toString().trim();
        reg[headerKey] = row[index] || '';
      });
      // Ensure camelCase fields and id
      reg.id = reg.id || reg['ID'] || reg['Id'] || '';
      reg.badgeId = reg.badgeId || reg['Badge ID'] || reg['badgeId'] || '';
      reg.firstName = reg.firstName || reg['First Name'] || reg['firstName'] || '';
      reg.lastName = reg.lastName || reg['Last Name'] || reg['lastName'] || '';
      reg.parentEmail = reg.parentEmail || reg['Parent Email'] || reg['parentEmail'] || '';
      reg.sessionId = reg.sessionId || reg['Session ID'] || reg['sessionId'] || '';
      reg.sessionDate = reg.sessionDate || reg['Session Date'] || reg['sessionDate'] || '';
      reg.sessionTime = reg.sessionTime || reg['Session Time'] || reg['sessionTime'] || '';
      reg.sessionTopic = reg.sessionTopic || reg['Session Topic'] || reg['sessionTopic'] || '';
      reg.registeredBy = reg.registeredBy || reg['Registered By'] || reg['registeredBy'] || '';
      reg.registeredDateAndTime = reg.registeredDateAndTime || reg['Registered Date And Time'] || reg['registeredDateAndTime'] || '';
      registrations.push(reg);
    }
    
    return {
      success: true,
      registrations: registrations
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Save registration to Google Sheets (returns data object, not ContentService output)
 */
function saveRegistrationData(regData) {
  try {
    if (!regData) {
      return {
        success: false,
        error: 'Registration data is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(REGISTRATION_SHEET_ID).getSheetByName(REGISTRATION_SHEET_NAME);
    
    // Get headers
    var lastCol = sheet.getLastColumn();
    var headers = [];
    
    if (lastCol > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    }
    
    // If sheet is empty, add headers
    if (headers.length === 0 || !headers[0] || headers[0] === '') {
      headers = ['id', 'badgeId', 'firstName', 'lastName', 'familyRole', 'age', 'house', 'level', 'school', 'parent', 'parentEmail', 'sessionId', 'sessionDate', 'sessionTime', 'sessionTopic', 'registeredBy', 'registeredDateAndTime'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Generate a unique ID if not provided
    var registrationId = regData.id || '';
    if (!registrationId) {
      // Generate ID: timestamp + random string
      registrationId = 'REG' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Prepare row data in the correct order
    var row = [];
    headers.forEach(function(header) {
      var headerKey = header.toString().trim();
      if (headerKey === 'id') {
        row.push(registrationId);
      } else {
        row.push(regData[headerKey] || regData[header] || '');
      }
    });
    
    // Append the new row
    sheet.appendRow(row);
    
    // Update the session's reg array with this registration ID
    var sessionId = regData.sessionId || '';
    if (sessionId) {
      try {
        updateSessionRegArray(sessionId, registrationId);
      } catch (sessionErr) {
        // Log error but don't fail the registration
        console.error('Error updating session reg array:', sessionErr);
      }
    }
    
    return {
      success: true,
      message: 'Registration saved successfully',
      id: registrationId  // Return the ID so frontend can use it
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Update a registration in Google Sheets (e.g., update badgeId)
 */
function updateRegistrationData(regData) {
  try {
    if (!regData || !regData.id) {
      return {
        success: false,
        error: 'Registration ID is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(REGISTRATION_SHEET_ID).getSheetByName(REGISTRATION_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: false,
        error: 'Registration sheet is empty'
      };
    }
    
    var headers = data[0];
    var idColIndex = headers.indexOf('id');
    
    if (idColIndex === -1) {
      return {
        success: false,
        error: 'ID column not found in registration sheet'
      };
    }
    
    // Find the registration row
    for (var i = 1; i < data.length; i++) {
      if (data[i][idColIndex] === regData.id) {
        // Found the registration, update it
        var row = [];
        headers.forEach(function(header) {
          var headerKey = header.toString().trim();
          if (headerKey === 'id') {
            row.push(regData.id);
          } else {
            // Use the value from regData if provided, otherwise keep existing value
            var colIndex = headers.indexOf(header);
            var existingValue = data[i][colIndex] || '';
            var newValue = regData[headerKey] || regData[header] || existingValue;
            row.push(newValue);
          }
        });
        
        // Update the row
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
        
        return {
          success: true,
          message: 'Registration updated successfully',
          id: regData.id
        };
      }
    }
    
    return {
      success: false,
      error: 'Registration not found'
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Update all registrations for a user (matching by firstName, lastName, parentEmail) with badgeId
 */
function updateAllRegistrationsForUser(userData) {
  try {
    if (!userData) {
      return {
        success: false,
        error: 'User data is required'
      };
    }
    
    var firstName = (userData.firstName || '').toString().trim().toLowerCase();
    var lastName = (userData.lastName || '').toString().trim().toLowerCase();
    var parentEmail = (userData.parentEmail || '').toString().trim().toLowerCase();
    var badgeId = (userData.badgeId || '').toString().trim();
    
    if (!firstName || !lastName || !parentEmail || !badgeId) {
      return {
        success: false,
        error: 'firstName, lastName, parentEmail, and badgeId are required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(REGISTRATION_SHEET_ID).getSheetByName(REGISTRATION_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: false,
        error: 'Registration sheet is empty'
      };
    }
    
    var headers = data[0];
    
    // Find column indices
    var firstNameColIndex = -1;
    var lastNameColIndex = -1;
    var parentEmailColIndex = -1;
    var badgeIdColIndex = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var headerKey = headers[h].toString().trim().toLowerCase();
      if (headerKey === 'firstname' || headerKey === 'first name') {
        firstNameColIndex = h;
      } else if (headerKey === 'lastname' || headerKey === 'last name') {
        lastNameColIndex = h;
      } else if (headerKey === 'parentemail' || headerKey === 'parent email') {
        parentEmailColIndex = h;
      } else if (headerKey === 'badgeid' || headerKey === 'badge id') {
        badgeIdColIndex = h;
      }
    }
    
    if (firstNameColIndex === -1 || lastNameColIndex === -1 || parentEmailColIndex === -1) {
      return {
        success: false,
        error: 'Required columns (firstName, lastName, parentEmail) not found in registration sheet'
      };
    }
    
    // If badgeId column doesn't exist, add it
    if (badgeIdColIndex === -1) {
      var lastCol = sheet.getLastColumn();
      badgeIdColIndex = lastCol;
      sheet.getRange(1, lastCol + 1).setValue('badgeId');
      headers.push('badgeId');
    }
    
    // Find all matching registrations and update them
    var updatedCount = 0;
    for (var i = 1; i < data.length; i++) {
      var rowFirstName = (data[i][firstNameColIndex] || '').toString().trim().toLowerCase();
      var rowLastName = (data[i][lastNameColIndex] || '').toString().trim().toLowerCase();
      var rowParentEmail = (data[i][parentEmailColIndex] || '').toString().trim().toLowerCase();
      
      if (rowFirstName === firstName && rowLastName === lastName && rowParentEmail === parentEmail) {
        // Found matching registration - update badgeId
        sheet.getRange(i + 1, badgeIdColIndex + 1).setValue(badgeId);
        updatedCount++;
      }
    }
    
    return {
      success: true,
      message: 'Updated ' + updatedCount + ' registration(s) with badgeId',
      updatedCount: updatedCount
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Update session's reg array to include a registration ID
 */
function updateSessionRegArray(sessionId, registrationId) {
  try {
    if (!sessionId || !registrationId) {
      return;
    }
    
    var sheet = SpreadsheetApp.openById(SESSIONS_SHEET_ID).getSheetByName(SESSIONS_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return;
    }
    
    var headers = data[0];
    var idColIndex = headers.indexOf('id');
    var regColIndex = headers.indexOf('reg');
    
    if (idColIndex === -1 || regColIndex === -1) {
      console.error('Session sheet missing id or reg column');
      return;
    }
    
    // Find the session row
    for (var i = 1; i < data.length; i++) {
      if (data[i][idColIndex] === sessionId) {
        // Get current reg array
        var regValue = data[i][regColIndex] || '[]';
        var regArray = [];
        
        // Parse the reg array (could be JSON string or already an array)
        if (typeof regValue === 'string' && regValue.trim() !== '') {
          try {
            regArray = JSON.parse(regValue);
          } catch (e) {
            // If not valid JSON, treat as empty array
            regArray = [];
          }
        } else if (Array.isArray(regValue)) {
          regArray = regValue;
        }
        
        // Check if registration ID already exists
        var exists = regArray.some(function(r) {
          return r === registrationId || (typeof r === 'object' && r.id === registrationId);
        });
        
        if (!exists) {
          // Add the registration ID
          regArray.push(registrationId);
          
          // Convert back to JSON string for storage
          var regJson = JSON.stringify(regArray);
          
          // Update the cell
          sheet.getRange(i + 1, regColIndex + 1).setValue(regJson);
          
          console.log('Updated session', sessionId, 'reg array with', registrationId);
        } else {
          console.log('Registration ID already exists in session reg array');
        }
        
        break;
      }
    }
  } catch (err) {
    console.error('Error in updateSessionRegArray:', err);
    throw err;
  }
}

/**
 * Get all sessions from Google Sheets
 */
function getSessionsData() {
  try {
    var sheet = SpreadsheetApp.openById(SESSIONS_SHEET_ID).getSheetByName(SESSIONS_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: true,
        sessions: []
      };
    }
    
    // Get headers (first row)
    var headers = data[0];
    
    // Convert rows to session objects
    var sessions = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var session = {};
      headers.forEach(function(header, index) {
        var headerKey = header.toString().trim();
        session[headerKey] = row[index] || '';
      });
      // Ensure required fields
      session.id = session.id || session['ID'] || session['id'] || '';
      session.dt = session.dt || session['Date'] || session['DateTime'] || '';
      session.topic = session.topic || session['Topic'] || session['topic'] || 'Public Speaking';
      session.capacity = session.capacity || session['Capacity'] || session['capacity'] || 10;
      // Parse arrays from JSON strings
      session.reg = session.reg ? (typeof session.reg === 'string' ? JSON.parse(session.reg) : session.reg) : [];
      session.att = session.att ? (typeof session.att === 'string' ? JSON.parse(session.att) : session.att) : [];
      sessions.push(session);
    }
    
    return {
      success: true,
      sessions: sessions
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Save a single session to Google Sheets
 */
function saveSessionData(sessionData) {
  try {
    if (!sessionData) {
      return {
        success: false,
        error: 'Session data is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(SESSIONS_SHEET_ID).getSheetByName(SESSIONS_SHEET_NAME);
    
    // Get headers
    var lastCol = sheet.getLastColumn();
    var headers = [];
    
    if (lastCol > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    }
    
    // If sheet is empty, add headers
    if (headers.length === 0 || !headers[0] || headers[0] === '') {
      headers = ['id', 'dt', 'topic', 'capacity', 'reg', 'att'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Check if session exists (by id)
    var data = sheet.getDataRange().getValues();
    var idColIndex = headers.indexOf('id');
    var existingRowIndex = -1;
    
    if (idColIndex >= 0) {
      for (var i = 1; i < data.length; i++) {
        if (data[i][idColIndex] === sessionData.id) {
          existingRowIndex = i + 1; // +1 because sheet rows are 1-indexed
          break;
        }
      }
    }
    
    // Prepare row data
    var row = [];
    headers.forEach(function(header) {
      var headerKey = header.toString().trim();
      var value = sessionData[headerKey] || sessionData[header] || '';
      // Convert arrays to JSON strings
      if (Array.isArray(value)) {
        value = JSON.stringify(value);
      }
      row.push(value);
    });
    
    if (existingRowIndex > 0) {
      // Update existing row
      sheet.getRange(existingRowIndex, 1, 1, headers.length).setValues([row]);
    } else {
      // Append new row
      sheet.appendRow(row);
    }
    
    return {
      success: true,
      message: 'Session saved successfully'
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Save all sessions to Google Sheets (replaces all)
 */
function saveAllSessionsData(sessions) {
  try {
    if (!sessions || !Array.isArray(sessions)) {
      return {
        success: false,
        error: 'Sessions array is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(SESSIONS_SHEET_ID).getSheetByName(SESSIONS_SHEET_NAME);
    
    // Clear existing data
    sheet.clear();
    
    // Add headers
    var headers = ['id', 'dt', 'topic', 'capacity', 'reg', 'att'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add all sessions
    if (sessions.length > 0) {
      var rows = sessions.map(function(s) {
        return [
          s.id || '',
          s.dt || '',
          s.topic || 'Public Speaking',
          s.capacity || 10,
          Array.isArray(s.reg) ? JSON.stringify(s.reg) : (s.reg || '[]'),
          Array.isArray(s.att) ? JSON.stringify(s.att) : (s.att || '[]')
        ];
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    return {
      success: true,
      message: 'All sessions saved successfully'
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Delete a session from Google Sheets
 * Also deletes all registrations associated with this session
 */
function deleteSessionData(sessionId) {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID is required'
      };
    }
    
    // First, delete all registrations for this session
    var regSheet = SpreadsheetApp.openById(REGISTRATION_SHEET_ID).getSheetByName(REGISTRATION_SHEET_NAME);
    var regData = regSheet.getDataRange().getValues();
    var deletedRegistrations = 0;
    
    if (regData.length > 0) {
      var regHeaders = regData[0];
      var sessionIdColIndex = regHeaders.indexOf('sessionId');
      
      // Try alternative column names if sessionId not found
      if (sessionIdColIndex === -1) {
        sessionIdColIndex = regHeaders.indexOf('Session ID');
      }
      if (sessionIdColIndex === -1) {
        sessionIdColIndex = regHeaders.indexOf('sessionId');
      }
      
      if (sessionIdColIndex !== -1) {
        // Delete rows from bottom to top to maintain correct indices
        for (var i = regData.length - 1; i >= 1; i--) {
          var rowSessionId = (regData[i][sessionIdColIndex] || '').toString().trim();
          if (rowSessionId === sessionId.toString().trim()) {
            regSheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
            deletedRegistrations++;
          }
        }
      }
    }
    
    // Now delete the session itself
    var sheet = SpreadsheetApp.openById(SESSIONS_SHEET_ID).getSheetByName(SESSIONS_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: true,
        message: 'Session not found (but ' + deletedRegistrations + ' registration(s) were deleted)'
      };
    }
    
    var headers = data[0];
    var idColIndex = headers.indexOf('id');
    
    if (idColIndex === -1) {
      return {
        success: false,
        error: 'ID column not found in sessions sheet'
      };
    }
    
    // Find and delete the session row
    var sessionDeleted = false;
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][idColIndex] === sessionId) {
        sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
        sessionDeleted = true;
        break;
      }
    }
    
    if (sessionDeleted) {
      var message = 'Session deleted successfully';
      if (deletedRegistrations > 0) {
        message += ' (' + deletedRegistrations + ' registration(s) also deleted)';
      }
      return {
        success: true,
        message: message,
        deletedRegistrations: deletedRegistrations
      };
    } else {
      return {
        success: true,
        message: 'Session not found (but ' + deletedRegistrations + ' registration(s) were deleted)',
        deletedRegistrations: deletedRegistrations
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Get all validation data from Google Sheets
 */
function getValidationData() {
  try {
    var sheet = SpreadsheetApp.openById(VALIDATION_SHEET_ID).getSheetByName(VALIDATION_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return {
        success: true,
        members: []
      };
    }
    
    // Get headers (first row)
    var headers = data[0];
    
    // Convert rows to objects
    var members = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var member = {};
      headers.forEach(function(header, index) {
        var headerKey = header.toString().trim();
        member[headerKey] = row[index] || '';
      });
      // Ensure camelCase fields exist
      member.firstName = member.firstName || member['First Name'] || '';
      member.lastName = member.lastName || member['Last Name'] || '';
      member.badgeId = member.badgeId || member['Badge ID'] || member['badgeId'] || '';
      member.familyRole = member.familyRole || member['Family Role'] || '';
      member.age = member.age || member['Age'] || '';
      member.house = member.house || member['House'] || '';
      member.level = member.level || member['Level'] || '';
      member.school = member.school || member['School'] || '';
      member.parent = member.parent || member['Parent'] || '';
      member.parentEmail = member.parentEmail || member['Parent Email'] || member['parentEmail'] || '';
      // Store row index (1-indexed, +1 because arrays are 0-indexed and row 1 is header)
      member._rowIndex = i + 1;
      members.push(member);
    }
    
    return {
      success: true,
      members: members
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Update a member in the validation sheet (or add new if no _rowIndex)
 */
function updateValidationData(memberData) {
  try {
    if (!memberData) {
      return {
        success: false,
        error: 'Member data is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(VALIDATION_SHEET_ID).getSheetByName(VALIDATION_SHEET_NAME);
    
    // Get headers
    var lastCol = sheet.getLastColumn();
    var headers = [];
    if (lastCol > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    }
    
    // If no headers, create default headers
    if (headers.length === 0 || !headers[0] || headers[0] === '') {
      headers = ['badgeId', 'firstName', 'lastName', 'familyRole', 'age', 'house', 'level', 'school', 'parent', 'parentEmail'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Ensure badgeId column exists - check if it's missing and add it
    var badgeIdColIndex = -1;
    for (var h = 0; h < headers.length; h++) {
      var headerKey = headers[h].toString().trim().toLowerCase();
      if (headerKey === 'badgeid' || headerKey === 'badge id' || headerKey === 'badgeid') {
        badgeIdColIndex = h;
        break;
      }
    }
    
    // If badgeId column doesn't exist, add it
    if (badgeIdColIndex === -1) {
      // Add badgeId as the first column
      sheet.insertColumnBefore(1);
      sheet.getRange(1, 1).setValue('badgeId');
      // Update headers array
      headers.unshift('badgeId');
      badgeIdColIndex = 0;
    }
    
    // Prepare row data
    var row = [];
    headers.forEach(function(header) {
      var headerKey = header.toString().trim();
      // Map camelCase to possible header variations
      var value = '';
      if (headerKey.toLowerCase() === 'badgeid' || headerKey.toLowerCase() === 'badge id') {
        value = memberData.badgeId || '';
      } else if (headerKey.toLowerCase() === 'firstname' || headerKey.toLowerCase() === 'first name') {
        value = memberData.firstName || '';
      } else if (headerKey.toLowerCase() === 'lastname' || headerKey.toLowerCase() === 'last name') {
        value = memberData.lastName || '';
      } else if (headerKey.toLowerCase() === 'familyrole' || headerKey.toLowerCase() === 'family role') {
        value = memberData.familyRole || '';
      } else if (headerKey.toLowerCase() === 'age') {
        value = memberData.age || '';
      } else if (headerKey.toLowerCase() === 'house') {
        value = memberData.house || '';
      } else if (headerKey.toLowerCase() === 'level') {
        value = memberData.level || '';
      } else if (headerKey.toLowerCase() === 'school') {
        value = memberData.school || '';
      } else if (headerKey.toLowerCase() === 'parent') {
        value = memberData.parent || '';
      } else if (headerKey.toLowerCase() === 'parentemail' || headerKey.toLowerCase() === 'parent email') {
        value = memberData.parentEmail || '';
      } else {
        // Try direct match
        value = memberData[headerKey] || memberData[header] || '';
      }
      row.push(value);
    });
    
    // If _rowIndex provided, update existing row
    if (memberData._rowIndex) {
      var rowIndex = parseInt(memberData._rowIndex);
      if (rowIndex < 2) {
        return {
          success: false,
          error: 'Invalid row index'
        };
      }
      // Update the row
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
      return {
        success: true,
        message: 'Member updated successfully'
      };
    } else {
      // Try to find existing user by firstName, lastName, and parentEmail
      var firstName = (memberData.firstName || '').toString().trim().toLowerCase();
      var lastName = (memberData.lastName || '').toString().trim().toLowerCase();
      var parentEmail = (memberData.parentEmail || '').toString().trim().toLowerCase();
      var badgeId = (memberData.badgeId || '').toString().trim();
      
      // Find column indices
      var firstNameColIndex = -1;
      var lastNameColIndex = -1;
      var parentEmailColIndex = -1;
      
      for (var h = 0; h < headers.length; h++) {
        var headerKey = headers[h].toString().trim().toLowerCase();
        if (headerKey === 'firstname' || headerKey === 'first name') {
          firstNameColIndex = h;
        } else if (headerKey === 'lastname' || headerKey === 'last name') {
          lastNameColIndex = h;
        } else if (headerKey === 'parentemail' || headerKey === 'parent email') {
          parentEmailColIndex = h;
        }
      }
      
      // If we have the required columns and search criteria, try to find existing user
      if (firstNameColIndex >= 0 && lastNameColIndex >= 0 && parentEmailColIndex >= 0 && 
          firstName && lastName && parentEmail) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var rowFirstName = (data[i][firstNameColIndex] || '').toString().trim().toLowerCase();
          var rowLastName = (data[i][lastNameColIndex] || '').toString().trim().toLowerCase();
          var rowParentEmail = (data[i][parentEmailColIndex] || '').toString().trim().toLowerCase();
          
          if (rowFirstName === firstName && rowLastName === lastName && rowParentEmail === parentEmail) {
            // Found existing user - update with badgeId
            // Update the badgeId column
            if (badgeIdColIndex >= 0 && badgeId) {
              sheet.getRange(i + 1, badgeIdColIndex + 1).setValue(badgeId);
            }
            // Also update other fields if provided
            for (var j = 0; j < headers.length; j++) {
              var headerKey = headers[j].toString().trim();
              var value = row[j];
              if (headerKey.toLowerCase() === 'badgeid' || headerKey.toLowerCase() === 'badge id') {
                if (badgeId) value = badgeId;
              } else if (headerKey.toLowerCase() === 'firstname' || headerKey.toLowerCase() === 'first name') {
                if (memberData.firstName) value = memberData.firstName;
              } else if (headerKey.toLowerCase() === 'lastname' || headerKey.toLowerCase() === 'last name') {
                if (memberData.lastName) value = memberData.lastName;
              } else if (headerKey.toLowerCase() === 'parentemail' || headerKey.toLowerCase() === 'parent email') {
                if (memberData.parentEmail) value = memberData.parentEmail;
              } else {
                var memberValue = memberData[headerKey] || memberData[header] || '';
                if (memberValue) value = memberValue;
              }
              row[j] = value;
            }
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
            return {
              success: true,
              message: 'Existing member updated with badgeId',
              _rowIndex: i + 1
            };
          }
        }
      }
      
      // No existing user found, append new row
      sheet.appendRow(row);
      return {
        success: true,
        message: 'Member added successfully'
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Delete a member from the validation sheet
 */
function deleteValidationData(rowIndex) {
  try {
    if (!rowIndex) {
      return {
        success: false,
        error: 'Row index is required'
      };
    }
    
    var sheet = SpreadsheetApp.openById(VALIDATION_SHEET_ID).getSheetByName(VALIDATION_SHEET_NAME);
    var rowNum = parseInt(rowIndex);
    
    if (rowNum < 2) {
      return {
        success: false,
        error: 'Invalid row index (cannot delete header row)'
      };
    }
    
    // Delete the row
    sheet.deleteRow(rowNum);
    
    return {
      success: true,
      message: 'Member deleted successfully'
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}
