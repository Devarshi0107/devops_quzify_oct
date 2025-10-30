// metrics/index.js
const client = require('prom-client');
const { requestCounter } = require('./requestCount');
const { activeRequestsGauge } = require('./activeRequests');
const { httpRequestDurationMs } = require('./requestTime');

// Start default metrics collection (CPU, heap, etc). Call once.
client.collectDefaultMetrics({ timeout: 10000 });

/**
 * Express middleware to measure:
 *  - active requests (gauge)
 *  - total requests (counter)
 *  - request duration (histogram)
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // increment active requests
  try { activeRequestsGauge.inc(); } catch (e) { /* ignore */ }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = (req.route && req.route.path) ? req.route.path : req.path || 'unknown';
    const method = req.method || 'UNKNOWN';
    const status = String(res.statusCode || 0);

    // increment counter
    try {
      // safe approach: use labels(...) then inc()
      requestCounter.labels(method, route, status).inc();
    } catch (err) {
      // fallback
      try { requestCounter.inc({ method, route, status_code: status }, 1); } catch(e) {}
    }

    // observe histogram
    try {
      httpRequestDurationMs.labels(method, route, status).observe(duration);
    } catch (err) {
      try { httpRequestDurationMs.observe({ method, route, status_code: status }, duration); } catch(e) {}
    }

    // decrement active requests
    try { activeRequestsGauge.dec(); } catch (e) {}
  });

  next();
};

module.exports = { metricsMiddleware, promClient: client };
