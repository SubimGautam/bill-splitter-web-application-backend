import express from 'express';
import authRoutes from './auth.route';
import groupRoutes from './group.route';
import expenseRoutes from './expense.route';
import dashboardRoutes from './dashboard.route';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes - require authentication
router.use('/groups', authMiddleware, groupRoutes);
router.use('/expenses', authMiddleware, expenseRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);

// Test route (public)
router.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Health check (public)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongo: 'connected' 
  });
});

export default router;