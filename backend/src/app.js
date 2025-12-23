import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.js"
import roles from "./routes/roles.js";

import salesRoutes from './routes/sales.js';

const app = express();

// --- Middleware global ---
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// --- Endpoint health check ---
app.get('/status', (req, res) => {
    res.json({ ok: true });
});

// --- Routing utama ---
app.use('/api', salesRoutes);

app.use('/roles', roles);

app.use('/auth', authRoutes);

export default app;
