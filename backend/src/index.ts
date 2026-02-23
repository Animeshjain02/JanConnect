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
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.ALLOWED_ORIGIN || 'https://jan-connect.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('CivicAI - JanConnect Backend is running!');
});

// Database Connection
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/civicai').trim();

// Mask URI for safe logging
const maskedUri = MONGODB_URI.replace(/\/\/(.*):(.*)@/, '//***:***@');
console.log(`[DB] Attempting to connect to Atlas cluster...`);
console.log(`[DB] Masked URI: ${maskedUri}`);

mongoose.connect(MONGODB_URI, {
    authSource: 'admin' // Explicitly set authSource for Atlas
} as any)
    .then(() => {
        console.log('✅ [DB] Successfully connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`🚀 [Server] Running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ [DB] Connection Error details:');
        console.error(`   - Code: ${error.code}`);
        console.error(`   - Message: ${error.message}`);

        if (error.message.includes('bad auth')) {
            console.error('\n--- TROUBLESHOOTING ---');
            console.error('1. The username or password in your .env is being rejected.');
            console.error('2. Please go to MongoDB Atlas -> Database Access.');
            console.error('3. Reset the password for jainanimesh029_db_user to X4_J-!FniF3XDJ@.');
            console.error('4. Ensure the user has "Atlas admin" or "Read and write to any database" roles.');
            console.error('5. Check "Network Access" and ensure your IP is whitelisted.\n');
        }
    });
