import express from 'express';
import { groupController } from '../controllers/group.controller';
import authMiddleware from '../middleware/auth';

console.log('groupController methods:', Object.keys(groupController));
console.log('getGroupWithBalances exists:', !!groupController.getGroupWithBalances);


const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all groups
router.get('/', groupController.getGroups);

// IMPORTANT: This specific route MUST come before the generic /:groupId route
router.get('/:groupId/balances', groupController.getGroupWithBalances);

// Get single group (this is a generic route that would also match "balances" if placed above)
router.get('/:groupId', groupController.getGroupById);

// Create group
router.post('/', groupController.createGroup);

// Update group
router.put('/:groupId', groupController.updateGroup);

// Delete group
router.delete('/:groupId', groupController.deleteGroup);

export default router;