const cacheMiddleware = require('./cacheMiddleware');

function invalidateCacheMiddleware(req, res, next) {
  // Wait until the response is successfully completed so failed writes
  // do not unnecessarily invalidate valid cached data.
  res.once('finish', () => {
    const successful = res.statusCode >= 200 && res.statusCode < 300;

    if (successful) {
      cacheMiddleware.clearCache();
    }
  });

  return next();
}

module.exports = invalidateCacheMiddleware;
