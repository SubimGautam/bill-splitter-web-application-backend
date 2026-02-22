// backend/src/routes/dashboard.route.ts
import express from 'express';
import auth from '../middleware/auth';
import User from '../models/user.model';
import Group from '../models/group.model';
import Expense from '../models/expense.model';

const router = express.Router();

// Get dashboard data
router.get('/', auth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    console.log('📊 Fetching dashboard for user:', userId);

    // Fetch user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Fetch groups
    const groups = await Group.find({ members: userId })
      .populate('members', 'username')
      .lean();

    // For each group, compute total balance
    const groupsWithDetails = await Promise.all(groups.map(async (group: any) => {
      const expenses = await Expense.find({ group: group._id });
      const totalBalance = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      return {
        id: group._id,
        name: group.name,
        members: group.members.length,
        totalBalance,
      };
    }));

    // Fetch recent expenses
    const recentExpenses = await Expense.find({
      $or: [{ paidBy: userId }, { 'splits.user': userId }]
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('paidBy', 'username')
      .populate('group', 'name')
      .lean();

    const formattedExpenses = recentExpenses.map((exp: any) => {
      const paidByUser = exp.paidBy._id.toString() === userId;
      const userSplit = exp.splits.find((s: any) => s.user.toString() === userId);
      const youOwe = userSplit ? userSplit.amount : 0;
      return {
        id: exp._id,
        description: exp.description,
        amount: exp.amount,
        paidBy: paidByUser ? 'You' : exp.paidBy.username,
        date: new Date(exp.date).toLocaleDateString(),
        groupName: exp.group.name,
        youPaid: paidByUser,
        youOwe: paidByUser ? 0 : youOwe,
      };
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        groups: groupsWithDetails,
        recentExpenses: formattedExpenses,
        balances: [],
        summary: {
          totalOwedToYou: 0,
          totalYouOwe: 0,
          pendingCount: 0,
        },
      },
    });
  } catch (err) {
    console.error('❌ Dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

export default router;