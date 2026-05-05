# Bearer Token Authentication API Documentation

## Overview
All API endpoints now require Bearer token authentication via the `Authorization` header instead of the `key` query parameter or header.

## Authentication

### Bearer Token Format
```
Authorization: Bearer YOUR_API_KEY
```

Replace `YOUR_API_KEY` with the value from your `.env` file's `KEY` variable.

### Example Request
```bash
curl -X GET "http://localhost:5001/session" \
  -H "Authorization: Bearer your_secret_key_here"
```

---

## API Endpoints

### Session Management

#### 1. GET /session
Get all active sessions with their status.

**Request:**
```bash
curl -X GET "http://localhost:5001/session" \
  -H "Authorization: Bearer your_secret_key"
```

**Response:**
```json
{
  "data": [
    {
      "session": "session-name",
      "status": "connected",
      "details": {
        "name": "John Doe",
        "phoneNumber": "1234567890"
      }
    }
  ]
}
```

#### 2. GET /session/:session
Get detailed information about a specific session.

**Request:**
```bash
curl -X GET "http://localhost:5001/session/session-name" \
  -H "Authorization: Bearer your_secret_key"
```

#### 3. POST /session/start
Start a new WhatsApp session with QR code.

**Request (JSON):**
```bash
curl -X POST "http://localhost:5001/session/start" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{"session":"new-session"}'
```

#### 4. GET /session/logout?session=SESSION_NAME
Logout a session and notify webhook.

**Parameters:**
- `session` (query) - Session name to logout

**Request:**
```bash
curl -X GET "http://localhost:5001/session/logout?session=session-name" \
  -H "Authorization: Bearer your_secret_key"
```

**or POST with JSON:**
```bash
curl -X POST "http://localhost:5001/session/logout" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{"session":"session-name"}'
```

**Response:**
```json
{
  "data": "success"
}
```

#### 5. POST /session/getsession ⭐ NEW
Get session status by session name.

**Request:**
```bash
curl -X POST "http://localhost:5001/session/getsession" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{"session_name":"session-name"}'
```

**Response:**
```json
{
  "session": "session-name",
  "status": "connected"
}
```

**Status Values:**
- `connected` - Session is active and connected
- `connecting` - Session is in the process of connecting
- `disconnected` - Session is disconnected
- `logout` - Session does not exist or is logged out

#### 6. DELETE /session/:session
Delete a session from the database.

**Request:**
```bash
curl -X DELETE "http://localhost:5001/session/session-name" \
  -H "Authorization: Bearer your_secret_key"
```

---

### Message Management

#### 1. POST /message/send-text
Send a text message.

**Request:**
```bash
curl -X POST "http://localhost:5001/message/send-text" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session-name",
    "to": "1234567890@s.whatsapp.net",
    "text": "Hello World",
    "is_group": false
  }'
```

**Note:** If session is logged out:
- Webhook will be notified with `disconnected` status
- Session will be removed from status map
- Error response: "Session is logged out"

#### 2. POST /message/send-image
Send an image message.

**Request:**
```bash
curl -X POST "http://localhost:5001/message/send-image" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session-name",
    "to": "1234567890@s.whatsapp.net",
    "text": "Image caption",
    "image_url": "https://example.com/image.jpg",
    "is_group": false
  }'
```

#### 3. POST /message/send-document
Send a document/file message.

**Request:**
```bash
curl -X POST "http://localhost:5001/message/send-document" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session-name",
    "to": "1234567890@s.whatsapp.net",
    "text": "Document caption",
    "document_url": "https://example.com/file.pdf",
    "document_name": "file.pdf",
    "is_group": false
  }'
```

#### 4. POST /message/send-video
Send a video message.

**Request:**
```bash
curl -X POST "http://localhost:5001/message/send-video" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session-name",
    "to": "1234567890@s.whatsapp.net",
    "text": "Video caption",
    "video_url": "https://example.com/video.mp4",
    "is_group": false
  }'
```

#### 5. POST /message/send-sticker
Send a sticker message.

**Request:**
```bash
curl -X POST "http://localhost:5001/message/send-sticker" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session-name",
    "to": "1234567890@s.whatsapp.net",
    "text": "Sticker",
    "image_url": "https://example.com/sticker.webp",
    "is_group": false
  }'
```

---

### Profile Management

#### 1. POST /profile
Get profile information for a contact.

**Request:**
```bash
curl -X POST "http://localhost:5001/profile" \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session-name",
    "target": "1234567890@s.whatsapp.net"
  }'
```

---

## Environment Configuration

Add your API key to `.env`:

```env
KEY=your_secret_api_key_here
WEBHOOK_BASE_URL=https://your-webhook-url.com
```

---

## Error Responses

### 401 Unauthorized - Missing Bearer Token
```json
{
  "message": "Missing Bearer token"
}
```

### 401 Unauthorized - Invalid Bearer Token
```json
{
  "message": "Invalid Bearer token"
}
```

### 400 Bad Request - Session Logged Out
```json
{
  "message": "Session is logged out"
}
```

### 400 Bad Request - Missing Parameters
```json
{
  "message": "session_name required"
}
```

---

## Webhook Notifications

When a session logs out via `/session/logout` or when a message fails to send due to session logout, a webhook is triggered.

### Webhook Payload
```json
{
  "session": "session-name",
  "status": "disconnected"
}
```

**Configure webhook URL in `.env`:**
```env
WEBHOOK_BASE_URL=https://your-server.com/webhook
```

---

## JavaScript Examples

### Fetch API Example
```javascript
async function sendMessage(sessionName, to, text) {
  const response = await fetch('http://localhost:5001/message/send-text', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your_secret_key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session: sessionName,
      to: to,
      text: text,
      is_group: false
    })
  });
  
  const data = await response.json();
  return data;
}

// Usage
sendMessage('session-name', '1234567890@s.whatsapp.net', 'Hello!');
```

### Get Session Status
```javascript
async function getSessionStatus(sessionName) {
  const response = await fetch('http://localhost:5001/session/getsession', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your_secret_key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_name: sessionName
    })
  });
  
  const data = await response.json();
  return data.status; // connected, disconnected, connecting, or logout
}

// Usage
const status = await getSessionStatus('session-name');
console.log(status);
```

### Logout Session and Notify Webhook
```javascript
async function logoutSession(sessionName) {
  const response = await fetch(`http://localhost:5001/session/logout?session=${sessionName}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your_secret_key'
    }
  });
  
  const data = await response.json();
  return data;
}

// Usage
logoutSession('session-name');
```

---

## Summary of Changes

✅ **Removed:** Query parameter `key` authentication
✅ **Removed:** Header `key` authentication  
✅ **Added:** Bearer token authentication via `Authorization: Bearer` header
✅ **Added:** `/session/getsession` endpoint (POST) - Get session status by name
✅ **Enhanced:** `/session/logout` - Now notifies webhook and deletes from status map
✅ **Enhanced:** `/message/send-*` - Now notifies webhook when session is logged out
✅ **Consistent:** All endpoints use Bearer token authentication
