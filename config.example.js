// Steamoji Workshop Registration Tool Configuration Template
// Copy this file to config.js and update with your actual values
// DO NOT commit config.js to version control

window.WORKSHOP_CONFIG = {
  // Admin password for accessing admin features
  ADMIN_PASS: 'CHANGE_THIS_PASSWORD',
  
  // Attendance password for accessing attendance features
  ATTEND_PASS: 'CHANGE_THIS_PASSWORD',
  
  // Staff authentication codes
  // Format: 'CODE': 'Name'
  // These codes are used for front desk authentication when registering new users
  STAFF: {
    'CODE1': 'Staff Name 1',
    'CODE2': 'Staff Name 2',
    'CODE3': 'Staff Name 3'
  },
  
  // Available workstation numbers for seat assignment
  WORKSTATIONS: [1, 2, 3, 4, 5, 6, 15, 16, 17, 18, 19, 20]
};

