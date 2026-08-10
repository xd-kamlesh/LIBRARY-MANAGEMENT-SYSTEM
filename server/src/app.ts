import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import transactionRoutes from './routes/transactionRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
