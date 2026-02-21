const express = require('express');
const prisma = require('../lib/prisma');
const cache = require('../lib/cache');

const router = express.Router();

// Get all endpoints
router.get('/endpoints', async (req, res) => {
    try {
        const endpoints = await prisma.endpoint.findMany();
        res.json(endpoints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching endpoints', error: error.message });
    }
});

// Create new endpoint
router.post('/endpoints', async (req, res) => {
    const { method, path, targetUrl, authRequired, rateLimit } = req.body;
    try {
        const endpoint = await prisma.endpoint.create({
            data: { method, path, targetUrl, authRequired, rateLimit: parseInt(rateLimit) || 100 }
        });
        cache.flushAll(); // Clear cache on change
        res.status(201).json(endpoint);
    } catch (error) {
        res.status(400).json({ message: 'Error creating endpoint', error: error.message });
    }
});

// Update endpoint
router.put('/endpoints/:id', async (req, res) => {
    const { id } = req.params;
    const { method, path, targetUrl, authRequired, rateLimit } = req.body;
    try {
        const endpoint = await prisma.endpoint.update({
            where: { id },
            data: { method, path, targetUrl, authRequired, rateLimit: parseInt(rateLimit) || 100 }
        });
        cache.flushAll(); // Clear cache on change
        res.json(endpoint);
    } catch (error) {
        res.status(400).json({ message: 'Error updating endpoint', error: error.message });
    }
});

// Delete endpoint
router.delete('/endpoints/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.endpoint.delete({ where: { id } });
        cache.flushAll(); // Clear cache on change
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting endpoint', error: error.message });
    }
});

// Get/Set Config (for API keys, etc)
router.get('/config', async (req, res) => {
    const configs = await prisma.config.findMany();
    res.json(configs);
});

router.post('/config', async (req, res) => {
    const { key, value } = req.body;
    const config = await prisma.config.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    });
    // Optional: flush cache if config affects routing headers
    res.json(config);
});

module.exports = router;
