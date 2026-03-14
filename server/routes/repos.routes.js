import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { catchAsync } from '../utils/catchAsync.js';
import Repo from '../models/Repo.model.js';
import Commit from '../models/Commit.model.js';
import { syncAllForUser } from '../services/githubService.js';

const router = express.Router();

/**
 * @route   GET /api/v1/repos
 * @desc    Get all synced repos for the logged in user
 * @access  Private
 */
router.get('/', protect, catchAsync(async (req, res) => {
  const repos = await Repo.find({ userId: req.user.id }).sort({ lastCommitAt: -1 });
  
  res.status(200).json({
    success: true,
    data: repos,
  });
}));

/**
 * @route   POST /api/v1/repos/sync
 * @desc    Manually trigger sync for all repos and commits
 * @access  Private
 */
router.post('/sync', protect, catchAsync(async (req, res) => {
  // Trigger sync in background or wait for it? 
  // Let's trigget it and return success immediately with syncStatus=syncing
  syncAllForUser(req.user).catch(err => console.error('[Sync] Background sync failed:', err.message));
  
  res.status(200).json({
    success: true,
    message: 'Sync started in the background.',
  });
}));

/**
 * @route   GET /api/v1/repos/:id/commits
 * @desc    Get commits for a specific repo
 * @access  Private
 */
router.get('/:id/commits', protect, catchAsync(async (req, res) => {
  const commits = await Commit.find({ 
    userId: req.user.id, 
    repoId: req.params.id 
  }).sort({ timestamp: -1 });
  
  res.status(200).json({
    success: true,
    data: commits,
  });
}));

export default router;
