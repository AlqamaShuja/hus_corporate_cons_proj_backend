const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const PORT = process.env.PORT || 5007;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Treklin',
      version: '1.0.0',
      description: 'API documentation for Treklin (Case Management System)',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js"),],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
