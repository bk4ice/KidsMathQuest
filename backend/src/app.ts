import express from 'express';
import cors from 'cors';
import path from 'path';
import './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import parentRoutes from './routes/parent';
import childRoutes from './routes/child';
import uploadRoutes from './routes/upload';
import { startCronJobs } from './utils/cronJobs';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/children', childRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

startCronJobs();

export default app;
