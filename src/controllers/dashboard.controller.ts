// backend/src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import Group from '../models/group.model';
import Expense from '../models/expense.model';

export const dashboardController = {
  getDashboard: async (req: any, res: Response) => {
    try {
      const userId = req.user.userId;

      // Get all groups for user
      // In dashboard controller
const groups = await Group.find({ createdBy: userId }).lean();
const groupsWithBalance = await Promise.all(groups.map(async (group) => {
  const expenses = await Expense.find({ group: group._id });
  const totalBalance = expenses.reduce((sum, e) => sum + e.amount, 0);
  return { ...group, totalBalance };
}));

const recentExpenses = await Expense.find({ group: { $in: groups.map(g => g._id) } })
  .sort({ date: -1 })
  .limit(5)
  .populate('group', 'name')
  .lean();

const formattedExpenses = recentExpenses.map(e => ({
  ...e,
  groupName: (e.group as any).name,
}));
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};