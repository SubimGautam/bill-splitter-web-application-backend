import { Request, Response } from 'express';
import Settlement from '../models/settlement.model';
import Group from '../models/group.model';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const settlementController = {
  // Create a new settlement
  createSettlement: async (req: AuthRequest, res: Response) => {
    try {
      const { from, to, amount, groupId } = req.body;
      const userId = req.user?.userId;

      // Verify group exists and user is creator (or member)
      const group = await Group.findOne({ _id: groupId, createdBy: userId });
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found or access denied' });
      }

      // Validate that from and to are members of the group
      if (!group.members.includes(from) || !group.members.includes(to)) {
        return res.status(400).json({ success: false, message: 'Both users must be group members' });
      }

      const settlement = new Settlement({
        from,
        to,
        amount,
        group: groupId,
      });
      await settlement.save();

      res.status(201).json({ success: true, data: settlement });
    } catch (error) {
      console.error('Create settlement error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get all settlements for a group
  getGroupSettlements: async (req: AuthRequest, res: Response) => {
    try {
      const groupId = req.params.groupId;
      const settlements = await Settlement.find({ group: groupId }).sort({ date: -1 });
      res.json({ success: true, data: settlements });
    } catch (error) {
      console.error('Get settlements error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};