require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const configRoutes = require('./routes/config');
const dynamicRoutes = require('./routes/dynamic');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/config', configRoutes);

// Health Check
app.get('/healthz', (req, res) => res.send('OK'));

// Dynamic Routing (should be last)
app.use('/', dynamicRoutes);

app.listen(PORT, () => {
    console.log(`API Engine running on port ${PORT}`);
});
