const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Update profile
router.put('/update-profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, bio, phone, location } = req.body;

    // Check if email/username is taken by another user
    const existingUser = await User.findOne({
      $or: [
        { email, _id: { $ne: userId } },
        { username, _id: { $ne: userId } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already taken'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, bio, phone, location },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;