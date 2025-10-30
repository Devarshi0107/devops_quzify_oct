// metrics/requestCount.js
const client = require('prom-client');

// Counter for total requests
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

module.exports = { requestCounter };
