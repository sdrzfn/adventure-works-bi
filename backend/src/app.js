import express from 'express';
import cors from 'cors';

import salesRoutes from './routes/sales.js';

const app = express();

// --- Middleware global ---
app.use(cors());
app.use(express.json());

// --- Endpoint health check ---
app.get('/status', (req, res) => {
    res.json({ ok: true });
});

// --- Routing utama ---
app.use('/api', salesRoutes);

export default app;
