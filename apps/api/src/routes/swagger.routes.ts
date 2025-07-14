import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from '../config/swagger';

const router = Router();

// Swagger UI setup
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add default headers
      req.headers['Content-Type'] = 'application/json';
      return req;
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 20px; margin: 20px 0; border-radius: 4px }
  `,
  customSiteTitle: 'Real Estate DX System API Documentation',
  customfavIcon: '/favicon.ico',
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, swaggerOptions));

// Serve raw OpenAPI spec as JSON
router.get('/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Serve raw OpenAPI spec as YAML
router.get('/openapi.yaml', (_req, res) => {
  const yaml = require('js-yaml');
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(yaml.dump(specs));
});

export default router;