// swagger.js
const fs = require('fs');
const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger-output.json';
const endpointsFiles = ['app.js'];

const doc = {
  info: {
    title: 'Service Nxt API',
    description: 'API Documentation with Authorization',
  },
  host: 'localhost:8002',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: "Enter JWT token as: Bearer <token>",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation with authorization generated!');

  // Read generated Swagger JSON
  const swaggerData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  
  // Count total APIs
  const totalApis = Object.keys(swaggerData.paths).length;
  console.log('Total APIs:', totalApis);

  // Optionally, add it to info
  swaggerData.info['x-totalApis'] = totalApis;

  // Save back to file
  fs.writeFileSync(outputFile, JSON.stringify(swaggerData, null, 2));
});
