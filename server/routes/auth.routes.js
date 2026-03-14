import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/auth/github
 * @desc    Initialize GitHub OAuth login
 * @access  Public
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

/**
 * @route   GET /api/v1/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('[Auth] Final redirect URL:', `${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
  // Clear any server-side session if necessary
  // Since we're using JWTs in memory, the "logout" logic 
  // primarily happens in the frontend by clearing the memory token.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
