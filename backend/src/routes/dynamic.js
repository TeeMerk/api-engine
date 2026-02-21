const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const prisma = require('../lib/prisma');
const cache = require('../lib/cache');

const router = express.Router();

// Catch-all dynamic route
router.all('*', async (req, res, next) => {
    const path = req.path;
    const method = req.method;
    const cacheKey = `endpoint:${method}:${path}`;

    try {
        // 1. Try to find in cache (exact match or previously resolved wildcard)
        let endpoint = cache.get(cacheKey);
        let rewriteTarget = path; // Default to rewriting the whole path if exact

        // 2. If not in cache, resolve it
        if (!endpoint) {
            // Check exact match first
            endpoint = await prisma.endpoint.findFirst({
                where: { path, method }
            });

            // 3. If no exact match, try wildcard resolution
            if (!endpoint) {
                const allEndpoints = await prisma.endpoint.findMany({
                    where: { method }
                });

                // Find matching wildcards (e.g., /api/*)
                const matching = allEndpoints.filter(ep => {
                    if (!ep.path.includes('*')) return false;
                    // Escape regex special chars except * which we turn into .*
                    const escaped = ep.path.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
                    const regex = new RegExp(`^${escaped}$`);
                    return regex.test(path);
                });

                if (matching.length > 0) {
                    // Pick the most specific match (longest path)
                    endpoint = matching.sort((a, b) => b.path.length - a.path.length)[0];
                    // For wildcards, we rewrite up to the star's position
                    // e.g., /api/* matched /api/users -> we strip /api/
                    rewriteTarget = endpoint.path.split('*')[0];
                }
            }

            // 4. Cache the resolved endpoint and the rewrite context if found
            if (endpoint) {
                cache.set(cacheKey, { ...endpoint, dynamicRewrite: rewriteTarget });
            }
        }

        if (!endpoint) {
            return res.status(404).json({ message: `No endpoint configured for ${method} ${path}` });
        }

        // Use the cached or newly resolved rewrite target
        const stripPath = endpoint.dynamicRewrite || path;

        // Proxy the request
        const proxy = createProxyMiddleware({
            target: endpoint.targetUrl,
            changeOrigin: true,
            pathRewrite: {
                [`^${stripPath.replace(/\/$/, '')}`]: '', // Strip base but keep sub-paths
            },
            onError: (err, req, res) => {
                console.error(`Proxy Error (${method} ${path}):`, err.message);
                res.status(502).json({
                    message: 'Bad Gateway: The target service is unreachable',
                    error: err.message,
                    target: endpoint.targetUrl
                });
            },
            onProxyRes: (proxyRes, req, res) => {
                if (proxyRes.statusCode === 404) {
                    console.warn(`Target 404 (${method} ${path}) -> ${endpoint.targetUrl}`);
                }
            }
        });

        return proxy(req, res, next);
    } catch (error) {
        console.error('Routing error:', error);
        res.status(500).json({ message: 'Internal routing error', error: error.message });
    }
});

module.exports = router;
