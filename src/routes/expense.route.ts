import express from 'express';
import { expenseController } from '../controllers/expense.controller';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Test route (public)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Expense router working' });
});

// Apply auth middleware to all routes below
router.use(authMiddleware);

// Create expense
router.post('/', expenseController.createExpense);

// Get expenses for a group
router.get('/group/:groupId', expenseController.getGroupExpenses);

// Delete expense
router.delete('/:expenseId', expenseController.deleteExpense);

export default router;