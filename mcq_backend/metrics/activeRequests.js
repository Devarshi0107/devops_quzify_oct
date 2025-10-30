// metrics/activeRequests.js
const client = require('prom-client');

const activeRequestsGauge = new client.Gauge({
  name: 'active_requests',
  help: 'Number of active in-flight requests'
});

module.exports = { activeRequestsGauge };
