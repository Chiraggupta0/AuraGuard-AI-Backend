const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuraGuard AI API',
      version: '1.0.0',
      description:
        'AI-powered privacy and safety layer for video conferencing platforms — REST API reference.',
    },
    servers: [{ url: `/api/${env.apiVersion}` }, { url: '/' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // JSDoc @openapi annotations in route files are picked up from here.
  apis: ['./src/modules/**/*.routes.js', './src/docs/**/*.yaml'],
};

module.exports = swaggerJsdoc(options);
