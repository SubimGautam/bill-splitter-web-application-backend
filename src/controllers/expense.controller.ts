import { Request, Response } from 'express';
import Expense from '../models/expense.model';
import Group from '../models/group.model';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const expenseController = {
  // Get expenses for a group
  getGroupExpenses: async (req: AuthRequest, res: Response) => {
    try {
      const groupId = req.params.groupId;
      console.log('Fetching expenses for group:', groupId);
      
      const expenses = await Expense.find({ group: groupId }).sort({ date: -1 });
      console.log('Found expenses:', expenses.length);
      
      res.json({ success: true, data: expenses });
    } catch (error) {
      console.error('Error in getGroupExpenses:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Create expense
  createExpense: async (req: AuthRequest, res: Response) => {
    try {
      const { description, amount, paidBy, groupId, participants } = req.body;
      const userId = req.user?.userId;

      console.log('Creating expense:', { description, amount, paidBy, groupId, participants });

      const group = await Group.findOne({ _id: groupId, createdBy: userId });
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      // Validate participants are members
      for (const p of participants) {
        if (!group.members.includes(p.name)) {
          return res.status(400).json({ success: false, message: `Invalid participant: ${p.name}` });
        }
      }

      // Validate total sum
      const totalSplit = participants.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        return res.status(400).json({ success: false, message: 'Sum of participants does not match total' });
      }

      const expense = new Expense({
        description,
        amount,
        paidBy,
        group: groupId,
        splits: participants,
        date: new Date()
      });
      await expense.save();

      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      console.error('Error in createExpense:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Delete expense
  deleteExpense: async (req: AuthRequest, res: Response) => {
    try {
      const expenseId = req.params.expenseId;
      console.log('Deleting expense:', expenseId);
      
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }
      
      await expense.deleteOne();
      res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};