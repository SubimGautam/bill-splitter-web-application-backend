import { Request, Response } from 'express';
import Group from '../models/group.model';
import Expense from '../models/expense.model';
import Settlement from '../models/settlement.model';
import { calculateGroupBalances } from '../utils/balancecalculator';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const groupController = {
  // Get all groups
  getGroups: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      console.log('Fetching groups for user:', userId);
      const groups = await Group.find({ createdBy: userId }).sort({ createdAt: -1 });
      console.log('Found groups:', groups.length);
      res.json({ success: true, data: groups });
    } catch (error) {
      console.error('Error in getGroups:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get single group
  getGroupById: async (req: AuthRequest, res: Response) => {
    try {
      const groupId = req.params.groupId;
      console.log('Fetching group by ID:', groupId);
      
      // Check if ID is valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        console.log('Invalid group ID format:', groupId);
        return res.status(400).json({ success: false, message: 'Invalid group ID format' });
      }
      
      const group = await Group.findById(groupId);
      
      if (!group) {
        console.log('Group not found:', groupId);
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      // Check if user owns this group
      if (group.createdBy.toString() !== req.user?.userId) {
        console.log('Access denied - user does not own this group');
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      console.log('Group found:', {
        id: group._id,
        name: group.name,
        members: group.members,
        createdBy: group.createdBy
      });
      
      res.json({ success: true, data: group });
    } catch (error) {
      console.error('Error in getGroupById:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Create group
  createGroup: async (req: AuthRequest, res: Response) => {
    try {
      const { name, members } = req.body;
      const createdBy = req.user?.userId;

      console.log('Creating group:', { name, members, createdBy });

      const group = new Group({
        name,
        members,
        createdBy
      });
      
      await group.save();
      console.log('Group created:', group._id);
      
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      console.error('Error in createGroup:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update group
  updateGroup: async (req: AuthRequest, res: Response) => {
    try {
      const { name, members } = req.body;
      const group = await Group.findByIdAndUpdate(
        req.params.groupId,
        { name, members },
        { new: true }
      );
      res.json({ success: true, data: group });
    } catch (error) {
      console.error('Error in updateGroup:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Delete group
  deleteGroup: async (req: AuthRequest, res: Response) => {
    try {
      await Group.findByIdAndDelete(req.params.groupId);
      res.json({ success: true, message: 'Group deleted' });
    } catch (error) {
      console.error('Error in deleteGroup:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // NEW: Get group with balances and settlements
  getGroupWithBalances: async (req: AuthRequest, res: Response) => {
    try {
      const groupId = req.params.groupId;
      console.log('Fetching group with balances for ID:', groupId);
      
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      // Check if user owns this group
      if (group.createdBy.toString() !== req.user?.userId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const expenses = await Expense.find({ group: groupId }).sort({ date: -1 });
      const settlements = await Settlement.find({ group: groupId }).sort({ date: -1 });
      const balances = await calculateGroupBalances(groupId, group.members);

      console.log('Found expenses:', expenses.length, 'settlements:', settlements.length, 'balances:', balances.length);

      res.json({
        success: true,
        data: {
          group,
          expenses,
          settlements,
          balances,
        },
      });
    } catch (error) {
      console.error('Error in getGroupWithBalances:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};