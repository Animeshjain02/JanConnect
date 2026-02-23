import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth-routes';
import complaintRoutes from './routes/complaint-routes';
import projectRoutes from './routes/project-routes';
import { initSlaEscalationJob } from './services/escalation-service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initSlaEscalationJob();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const isAllowed =
            !origin ||
            origin.includes('localhost') ||
            origin.endsWith('.vercel.app') ||
            origin === 'https://jan-connect-tawny.vercel.app' ||
            origin === process.env.ALLOWED_ORIGIN;
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/projects', projectRoutes);

// Health check
app.get('/', (_req: Request, res: Response) => {
    res.send('CivicAI - JanConnect Backend is running!');
});

// ✅ Bind port FIRST so Render detects an open port immediately
app.listen(PORT, () => {
    console.log(`🚀 [Server] Running on port ${PORT}`);
    console.log(`🌍 [Env] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
});

// Connect to MongoDB AFTER server is up
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set! Add it to your Render environment variables.');
} else {
    const maskedUri = MONGODB_URI.replace(/\/\/(.*):(.*)@/, '//***:***@');
    console.log(`[DB] Connecting to: ${maskedUri}`);

    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ [DB] Connected to MongoDB Atlas'))
        .catch((error) => {
            console.error('❌ [DB] Connection failed:', error.message);
            console.error('👉 Check MONGODB_URI environment variable in your Render dashboard.');
        });
}
