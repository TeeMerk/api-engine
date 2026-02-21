const NodeCache = require('node-cache');

// Standard TTL of 0 means keys never expire by default
// checkperiod of 600 means we check for expired keys every 10 minutes
const cache = new NodeCache({ stdTTL: 0, checkperiod: 600 });

module.exports = cache;
