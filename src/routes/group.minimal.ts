import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Group router working' });
});

router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;