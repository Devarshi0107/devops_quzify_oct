// metrics/requestTime.js
const client = require('prom-client');

// Histogram for request durations (milliseconds)
const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  // buckets in ms - adjust for your app
  buckets: [5, 15, 50, 100, 300, 500, 1000, 3000, 5000]
});

module.exports = { httpRequestDurationMs };
