# Quick Swagger Access Guide

## Immediate Access (No Setup Required)

### Option 1: Online Swagger Editor (Fastest)
1. Go to: https://editor.swagger.io/
2. Select "File" → "Import YAML"
3. Upload or paste the `swagger.yaml` file from your project root
4. Done! You can now view and test all endpoints

### Option 2: VS Code Extension
1. Install "OpenAPI (Swagger) Editor" extension
2. Right-click `swagger.yaml` → "Preview"
3. View interactive documentation

## Setup Swagger UI in Your Project (5 minutes)

### Step 1: Install Dependency
```bash
npm install swagger-ui-express yaml
```

### Step 2: Update `src/index.ts`
Add this after your middleware setup and before routes:

```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';

// Parse Swagger file
const swaggerFile = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

// ... in your app chain:
  .route('/', createSessionController())
  .route('/', createMessageController())
  .route('/', createProfileController())
  .use('/api-docs', swaggerUi.serve())
  .get('/api-docs', swaggerUi.setup(swaggerDocument))
  .route('/', createHealthController())
```

### Step 3: Start the App
```bash
npm start
```

### Step 4: Access Documentation
Open: `http://localhost:5001/api-docs`

## Features in Swagger UI

✅ **View all endpoints** with descriptions
✅ **See request/response schemas** with examples
✅ **Test endpoints directly** from the browser
✅ **Bearer token authentication** - Add your API key
✅ **Response examples** - See what each endpoint returns
✅ **Error documentation** - Understand error responses
✅ **Try it out** - Click and execute requests

## Testing an Endpoint

### Example: Get All Sessions

1. Navigate to `/session` GET endpoint
2. Click "Try it out"
3. Click "Execute"
4. See the response below

**Note:** Bearer token is automatically included from the Authorization header (add it via the "Authorize" button at top)

### Example: Send a Text Message

1. Navigate to `/message/send-text` POST endpoint
2. Click "Try it out"
3. Fill in the request body:
```json
{
  "session": "my-session",
  "to": "1234567890@s.whatsapp.net",
  "text": "Hello World",
  "is_group": false
}
```
4. Click "Execute"
5. Check the response

## Authenticate in Swagger UI

1. Click the "Authorize" button (top-right, with lock icon)
2. Fill in Bearer token: `your_api_key_here`
3. Click "Authorize"
4. Click "Close"
5. All subsequent requests will include your token

## API Endpoints Quick Reference

### Session Endpoints
- `GET /session` - List all sessions
- `GET /session/:session` - Get session details
- `POST /session/start` - Start new session
- `GET /session/logout?session=NAME` - Logout session
- `POST /session/getsession` - Get session status
- `DELETE /session/:session` - Delete session

### Message Endpoints
- `POST /message/send-text` - Send text message
- `POST /message/send-image` - Send image
- `POST /message/send-document` - Send document
- `POST /message/send-video` - Send video
- `POST /message/send-sticker` - Send sticker

### Profile Endpoints
- `POST /profile` - Get contact profile

### Health
- `GET /health` - Health check

## Troubleshooting

### YAML not parsing?
Install the `yaml` package:
```bash
npm install yaml
```

### Swagger route not working?
Make sure you add it BEFORE the `.notFound()` handler.

### Can't access `/api-docs`?
Check that:
1. The route is defined correctly
2. The app is running on `http://localhost:5001`
3. No other route is conflicting with `/api-docs`

## Export/Share Documentation

### Generate Static HTML
Use Swagger CLI or online tools to generate standalone HTML docs.

### Share as PDF
Use browser's print to PDF feature when viewing Swagger UI.

### Use ReDoc Alternative
For a different documentation style, install `redoc-express`:
```bash
npm install redoc-express
```

## Further Reading

- [Swagger/OpenAPI Tutorial](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger YAML Examples](https://github.com/OAI/OpenAPI-Specification/tree/master/examples)
