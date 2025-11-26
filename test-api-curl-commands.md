# Google Apps Script API - cURL Test Commands

Use these curl commands to test your Google Apps Script API endpoints.

## API URL
```
https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec
```

---

## 1. Save a Session (POST)

```bash
curl -X POST \
  "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=saveSession" \
  -H "Content-Type: text/plain" \
  -d '{
    "id": "test123",
    "dt": "2025-11-25T10:00:00.000Z",
    "topic": "Test Session",
    "capacity": 10,
    "reg": [],
    "att": []
  }'
```

**Expected Response:**
```json
{"success":true,"message":"Session saved successfully"}
```

---

## 2. Get All Sessions (GET)

```bash
curl -X GET \
  "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=getSessions"
```

**Expected Response:**
```json
{"success":true,"sessions":[...]}
```

---

## 3. Register a User (POST)

```bash
curl -X POST \
  "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=register" \
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
```

**Expected Response:**
```json
{"success":true,"message":"Registration saved successfully"}
```

---

## 4. Delete a Session (POST)

```bash
curl -X POST \
  "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=deleteSession&sessionId=test123" \
  -H "Content-Type: text/plain" \
  -d '{"sessionId": "test123"}'
```

**Expected Response:**
```json
{"success":true,"message":"Session deleted successfully"}
```

---

## 5. Lookup Member by Email (GET)

```bash
curl -X GET \
  "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=lookup&email=test@example.com"
```

**Expected Response:**
```json
{"success":true,"members":[...]}
```

---

## 6. Save All Sessions (POST)

```bash
curl -X POST \
  "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=saveAllSessions" \
  -H "Content-Type: text/plain" \
  -d '[
    {
      "id": "session1",
      "dt": "2025-11-25T10:00:00.000Z",
      "topic": "Session 1",
      "capacity": 10,
      "reg": [],
      "att": []
    },
    {
      "id": "session2",
      "dt": "2025-11-26T10:00:00.000Z",
      "topic": "Session 2",
      "capacity": 15,
      "reg": [],
      "att": []
    }
  ]'
```

**Expected Response:**
```json
{"success":true,"message":"All sessions saved successfully"}
```

---

## Windows PowerShell Version

If you're using Windows PowerShell, use these commands:

### Save Session:
```powershell
curl.exe -X POST "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=saveSession" -H "Content-Type: text/plain" -d '{\"id\":\"test123\",\"dt\":\"2025-11-25T10:00:00.000Z\",\"topic\":\"Test Session\",\"capacity\":10,\"reg\":[],\"att\":[]}'
```

### Get Sessions:
```powershell
curl.exe -X GET "https://script.google.com/macros/s/AKfycbz_sA-xBW35nrVhH54O53FXj7oM6PJzk0-24DiFL_PVRig9DGpl3O3eHkzknzsQSwU/exec?action=getSessions"
```

---

## Troubleshooting

- **If you get CORS errors**: Make sure the Web App is deployed with "Anyone" access
- **If you get "Invalid action"**: Check that the action parameter is correctly URL encoded
- **If you get 405 errors**: Make sure the URL ends with `/exec` (not `/dev`)
- **If you get permission errors**: Ensure your Google account has Editor access to the sheets

