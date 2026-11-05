import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.js"
import roles from "./routes/roles.js";
import testRoutes from "./routes/test.js";
import salesRoutes from './routes/sales.js';

const app = express();

// --- Middleware global ---
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://adventureworks-bi.vercel.app',
        'https://adventureworks.sadrakhzp.my.id'
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// --- Endpoint health check ---
app.get('/status', (req, res) => {
    res.json({ ok: true });
});

app.use("/api", testRoutes);

// --- Routing utama ---
app.use('/api', salesRoutes);

app.use('/roles', roles);

app.use('/auth', authRoutes);

export default app;