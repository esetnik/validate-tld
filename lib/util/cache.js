const cacheManager = require('cache-manager');

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 1,
  ttl: 86400 /* default ttl 1 day */,
});

module.exports = memoryCache;
