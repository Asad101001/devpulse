import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { syncAllForUser } from '../services/githubService.js';
import Commit from '../models/Commit.model.js';
import Repo from '../models/Repo.model.js';
import { catchAsync } from '../utils/catchAsync.js';

const router = express.Router();

/**
 * @route   POST /api/v1/data/sync
 * @desc    Trigger a full GitHub sync for the authenticated user
 * @access  Private
 */
router.post('/sync', protect, catchAsync(async (req, res) => {
  // Run sync in the background
  syncAllForUser(req.user).catch(err => {
    console.error('[Sync] Background error:', err.message);
  });

  res.status(202).json({
    success: true,
    message: 'Synchronization process started in the background.',
  });
}));

/**
 * @route   GET /api/v1/data/stats
 * @desc    Fetch aggregated statistics for the dashboard
 * @access  Private
 */
router.get('/stats', protect, catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  const statsAggregate = await Commit.aggregate([
    { $match: { userId } },
    { 
      $group: {
        _id: null,
        avgSentiment: { $avg: "$sentimentScore" },
        avgBurnout: { $avg: "$burnoutIndex" },
        totalCommits: { $count: {} },
        moodTags: { $push: "$moodTag" }
      }
    }
  ]);

  const stats = statsAggregate[0] || { avgSentiment: 50, avgBurnout: 0, totalCommits: 0, moodTags: [] };

  // Get chart data (last 7 days)
  const chartData = await Commit.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: { $dayOfWeek: "$timestamp" },
        score: { $avg: "$sentimentScore" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const formattedChart = chartData.map(d => ({
    name: days[d._id - 1],
    score: Math.round(d.score)
  }));

  // Top Mood
  const moodCounts = stats.moodTags.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.keys(moodCounts).sort((a,b) => moodCounts[b] - moodCounts[a])[0] || 'Unknown';

  res.status(200).json({
    success: true,
    data: {
      commitCount: stats.totalCommits || 0,
      avgSentiment: Math.round(stats.avgSentiment) || 0,
      avgBurnout: Math.round(stats.avgBurnout) || 0,
      topMood,
      chartData: formattedChart.length ? formattedChart : [
        { name: 'M', score: 50 }, { name: 'T', score: 50 }, { name: 'W', score: 50 }
      ],
      syncStatus: req.user.syncStatus,
      lastSyncedAt: req.user.lastSyncedAt
    },
  });
}));

export default router;
