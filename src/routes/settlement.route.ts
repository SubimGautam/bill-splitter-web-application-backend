import express from 'express';
import { settlementController } from '../controllers/settlement.controller';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/', settlementController.createSettlement);
router.get('/group/:groupId', settlementController.getGroupSettlements);

export default router;