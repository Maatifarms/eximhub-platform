const redis = require('redis');

let client;
if (process.env.REDIS_URL) {
    client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.connect().catch(console.error);
}

const cacheMiddleware = (ttl = 300) => async (req, res, next) => {
    if (!client || !client.isOpen) return next();

    const key = `exim_cache:${req.originalUrl}:${JSON.stringify(req.body)}`;
    
    try {
        const cachedData = await client.get(key);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        // Patch res.json to cache the response
        const originalJson = res.json;
        res.json = (data) => {
            client.setEx(key, ttl, JSON.stringify(data));
            return originalJson.call(res, data);
        };
        next();
    } catch (err) {
        console.error('Cache middleware error:', err);
        next();
    }
};

module.exports = cacheMiddleware;
