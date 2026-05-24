import NodeCache from 'node-cache';

// Initialize cache with default TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for authenticated users (except admin)
    if (req.user && req.user.role !== 'admin') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    if (cachedBody) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cachedBody));
    }

    // Store original send
    const originalSend = res.json;
    
    res.json = function(body) {
      // Cache the response
      if (res.statusCode === 200) {
        cache.set(key, JSON.stringify(body), duration);
      }
      res.setHeader('X-Cache', 'MISS');
      originalSend.call(this, body);
    };

    next();
  };
};

// Clear cache
export const clearCache = (pattern) => {
  if (pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchingKeys);
  } else {
    cache.flushAll();
  }
};

export default cacheMiddleware;