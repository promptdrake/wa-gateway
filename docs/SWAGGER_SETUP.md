# Swagger API Documentation Setup

This project includes a complete OpenAPI 3.0 specification for all API endpoints.

## Files

- `swagger.yaml` - OpenAPI 3.0 specification (in project root)

## Quick Start

### Option 1: Use Online Swagger Editor
Visit [Swagger Editor](https://editor.swagger.io/) and upload or paste the contents of `swagger.yaml`

### Option 2: Use Swagger UI Locally (Recommended)

#### Install Dependencies
```bash
npm install swagger-ui-express
```

#### Add Swagger Route to Your App

Update your `src/index.ts`:

```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';

const swaggerFile = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

const app = new Hono()
  // ... existing middleware ...
  
  // Add Swagger UI route
  .use('/api-docs', swaggerUi.serveFiles(swaggerDocument))
  .get('/api-docs', swaggerUi.setup(swaggerDocument))
  
  // ... rest of routes ...
```

If using `yaml` package, install it:
```bash
npm install yaml
```

Or use JSON instead (convert swagger.yaml to swagger.json first):

```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

app.use('/api-docs', swaggerUi.serveFiles(swaggerDocument));
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
```

#### Access Swagger UI

Once running, visit: `http://localhost:5001/api-docs`

### Option 3: Use Docker with Swagger UI

Create a `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  swagger-ui:
    image: swaggerapi/swagger-ui
    ports:
      - "8080:8080"
    environment:
      - SWAGGER_JSON=/swagger.yaml
    volumes:
      - ./swagger.yaml:/swagger.yaml
```

Then run:
```bash
docker-compose up swagger-ui
```

Visit: `http://localhost:8080`

### Option 4: Serve Static Swagger HTML

Create `public/swagger.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>WhatsApp Gateway API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: "/swagger.yaml",
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout"
        })
        window.ui = ui
      }
    </script>
  </body>
</html>
```

Then serve it from your static files directory.

## Testing with Swagger UI

1. Navigate to any endpoint in Swagger UI
2. Click "Try it out"
3. Enter the required parameters
4. Add your Bearer token in the "Authorization" header
5. Click "Execute"

### Example Bearer Token
```
Bearer your_secret_api_key_here
```

## OpenAPI Specification Details

### Authentication
All endpoints (except `/health`) require Bearer token authentication:
```
Authorization: Bearer YOUR_API_KEY
```

### Tags
- **Session** - Session management endpoints
- **Message** - Message sending endpoints
- **Profile** - Contact profile endpoints
- **Health** - Health check endpoint

### Status Codes
- `200` - Success
- `400` - Bad request or session logged out
- `401` - Unauthorized (missing or invalid Bearer token)
- `404` - Resource not found
- `500` - Server error

## Using with Postman

You can import the OpenAPI spec into Postman:

1. Open Postman
2. Click "Import"
3. Choose "Link" tab
4. Paste: `file:///path/to/swagger.yaml` (or upload the file)
5. Click "Import"
6. Add Bearer token to all requests in the "Authorization" tab

### Postman Collection Variables

Create a Postman environment with these variables:
```
{
  "base_url": "http://localhost:5001",
  "bearer_token": "your_secret_key_here",
  "session_name": "default-session",
  "contact_number": "1234567890@s.whatsapp.net"
}
```

## Generating Code from Swagger

You can use the Swagger Codegen to generate client libraries:

```bash
# Install Swagger Codegen
brew install swagger-codegen

# Generate TypeScript client
swagger-codegen generate -i swagger.yaml -l typescript-node -o ./generated-client
```

## API Documentation Structure

The swagger.yaml file includes:
- **Servers** - Development and production URLs
- **Components** - Reusable schemas and security schemes
- **Paths** - All API endpoints with operations
- **Security** - Bearer token authentication
- **Responses** - Detailed status codes and examples

## Updating the Specification

When adding new endpoints:

1. Update `swagger.yaml` with the new endpoint
2. Define request/response schemas in the `components` section
3. Add proper descriptions and examples
4. Test with Swagger UI

## Validation

Validate your swagger.yaml file:

```bash
# Online validator
# Visit: https://editor.swagger.io/

# Or use a CLI tool
npm install -g @apidevtools/swagger-cli
swagger-cli validate swagger.yaml
```

## References

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Swagger Editor](https://editor.swagger.io/)
