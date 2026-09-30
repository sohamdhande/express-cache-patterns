const CACHE_TTL_MS = 60 * 1000;

// key -> { value, createdAt }
const cache = new Map();

function getCacheEntry(key) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // TTL is measured from when the cache entry was created.
  const age = Date.now() - entry.createdAt;

  if (age > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry;
}

function setCacheEntry(key, value) {
  cache.set(key, {
    value,
    createdAt: Date.now(),
  });
}

function clearCache() {
  cache.clear();
}

function cacheMiddleware(req, res, next) {
  const key = req.originalUrl;
  const entry = getCacheEntry(key);

  if (entry) {
    res.set('X-Cache', 'HIT');
    return res.json(entry.value);
  }

  res.set('X-Cache', 'MISS');

  // Cache only successful JSON responses from GET requests.
  const originalJson = res.json.bind(res);

  res.json = body => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setCacheEntry(key, body);
    }

    return originalJson(body);
  };

  return next();
}

cacheMiddleware.clearCache = clearCache;
cacheMiddleware.getCacheSize = () => cache.size;

module.exports = cacheMiddleware;
