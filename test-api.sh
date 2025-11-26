#!/bin/bash

# Google Apps Script API Test Commands
# Replace the API_URL with your actual Web App URL if different

API_URL="https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec"

echo "=== Testing Google Apps Script API ==="
echo ""

# Test 1: Save a Session (POST)
echo "1. Testing saveSession..."
curl -X POST \
  "${API_URL}?action=saveSession" \
  -H "Content-Type: text/plain" \
  -d '{
    "id": "test123",
    "dt": "2025-11-25T10:00:00.000Z",
    "topic": "Test Session",
    "capacity": 10,
    "reg": [],
    "att": []
  }'
echo -e "\n\n"

# Test 2: Get Sessions (GET)
echo "2. Testing getSessions..."
curl -X GET \
  "${API_URL}?action=getSessions"
echo -e "\n\n"

# Test 3: Register a User (POST)
echo "3. Testing register..."
curl -X POST \
  "${API_URL}?action=register" \
  -H "Content-Type: text/plain" \
  -d '{
    "badgeId": "TEST001",
    "firstName": "Test",
    "lastName": "User",
    "parentEmail": "test@example.com",
    "sessionId": "test123",
    "sessionDate": "2025-11-25",
    "sessionTime": "10:00 AM",
    "sessionTopic": "Test Session",
    "registeredBy": "Admin",
    "registeredDateAndTime": "2025-11-20 10:00:00"
  }'
echo -e "\n\n"

# Test 4: Delete a Session (POST)
echo "4. Testing deleteSession..."
curl -X POST \
  "${API_URL}?action=deleteSession&sessionId=test123" \
  -H "Content-Type: text/plain" \
  -d '{"sessionId": "test123"}'
echo -e "\n\n"

# Test 5: Lookup by Email (GET)
echo "5. Testing lookup by email..."
curl -X GET \
  "${API_URL}?action=lookup&email=test@example.com"
echo -e "\n\n"

echo "=== Tests Complete ==="

