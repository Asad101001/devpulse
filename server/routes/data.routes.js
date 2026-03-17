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
  const totalCommitsCount = await Commit.countDocuments({ userId });
  
  // Auto-trigger sync if new user or data empty
  if (totalCommitsCount === 0 && req.user.syncStatus === 'idle') {
    syncAllForUser(req.user).catch(() => {});
  }

  // Advanced Aggregation for reflective stats
  const advancedStats = await Commit.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        avgSentiment: { $avg: "$sentimentScore" },
        avgBurnout: { $avg: "$burnoutIndex" },
        totalCommits: { $count: {} },
        avgAdditions: { $avg: "$additions" },
        avgDeletions: { $avg: "$deletions" },
        avgFilesChanged: { $avg: "$filesChanged" },
        moodTags: { $push: "$moodTag" },
        sentimentStdDev: { $stdDevPop: "$sentimentScore" },
        messages: { $push: "$message" }
      }
    }
  ]);

  const stats = advancedStats[0] || { 
    avgSentiment: 50, 
    avgBurnout: 0, 
    totalCommits: 0, 
    avgAdditions: 0, 
    avgDeletions: 0, 
    avgFilesChanged: 0, 
    moodTags: [],
    sentimentStdDev: 0,
    messages: []
  };

  // Calculate Linguistic Precision (avg word count)
  const totalWords = stats.messages.reduce((acc, msg) => acc + (msg?.split(/\s+/)?.length || 0), 0);
  const linguisticPrecision = stats.totalCommits > 0 ? Math.round(totalWords / stats.totalCommits) : 0;

  // Calculate Cognitive Load Score (0-100 normalized)
  // Higher additions/deletions and files changed = higher load
  const rawLoad = (stats.avgAdditions + stats.avgDeletions) / 10 + (stats.avgFilesChanged * 5);
  const cognitiveLoad = Math.min(Math.round(rawLoad), 100);

  // Calculate Signal Stability (100 - stdDev)
  const signalStability = Math.max(Math.round(100 - (stats.sentimentStdDev || 0)), 0);

  // 1. Chart Data (Last 7 Days)
  const chartData = await Commit.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: { $dayOfWeek: "$timestamp" },
        score: { $avg: "$sentimentScore" },
        load: { $avg: { $add: ["$additions", "$deletions"] } }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const formattedChart = chartData.map(d => ({
    name: days[d._id - 1],
    score: Math.round(d.score),
    load: Math.round(d.load / 10)
  }));

  // 2. Heatmap Data (Last 90 Days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const heatmapData = await Commit.aggregate([
    { $match: { userId, timestamp: { $gte: ninetyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // 3. Top Moods & Resonance
  const moodCounts = stats.moodTags.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.keys(moodCounts).sort((a,b) => moodCounts[b] - moodCounts[a])[0] || 'Unknown';
  const resonance = stats.totalCommits > 0 ? Math.round((moodCounts[topMood] / stats.totalCommits) * 100) : 0;

  // 4. Wrapped Extracted Stats
  const starRepo = await Commit.aggregate([
    { $match: { userId } },
    { $group: { _id: "$repoId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    { $lookup: { from: 'repos', localField: '_id', foreignField: '_id', as: 'repo' } },
    { $unwind: { path: '$repo', preserveNullAndEmptyArrays: true } }
  ]);

  const peakDayAgg = await Commit.aggregate([
    { $match: { userId } },
    { $group: { _id: { $dayOfWeek: "$timestamp" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  const lateNight = await Commit.countDocuments({
    userId,
    $expr: { $gte: [{ $hour: "$timestamp" }, 22] } // 10 PM onwards
  });

  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const repoCount = await Repo.countDocuments({ userId });
  
  // Fetch repos with commit counts
  const repoListRaw = await Repo.find({ userId }).sort({ name: 1 }).lean();
  const repoList = await Promise.all(repoListRaw.map(async (repo) => {
    const count = await Commit.countDocuments({ repoId: repo._id });
    const lastCommit = await Commit.findOne({ repoId: repo._id }).sort({ timestamp: -1 });
    return {
      ...repo,
      commitCount: count,
      lastActivity: lastCommit ? lastCommit.timestamp : repo.updatedAt
    };
  }));

  const recentCommits = await Commit.find({ userId })
    .sort({ timestamp: -1 })
    .limit(5)
    .populate('repoId', 'name');

  // 5. Generate Aggregated Directive (The Wellness Directive)
  const recentMessages = stats.messages.slice(0, 15).join('; ');
  let executiveDirective = "Maintain high-fidelity output. Monitor cognitive friction.";
  
  if (stats.totalCommits > 0) {
    // We could call Groq here for a single summary, but for now we'll derive from metrics
    if (stats.avgBurnout > 60) {
        executiveDirective = "CRITICAL: High burnout pulse detected. Immediate system cooling required. Halt all non-essential commits.";
    } else if (cognitiveLoad > 70) {
        executiveDirective = "WARNING: Heavy cognitive load. Engineering efficiency is degrading. Prioritize code stabilization over new features.";
    } else if (stats.avgSentiment < 40) {
        executiveDirective = "SIGNAL_FRICTION: Tone indicates frustration. Perform system reset and isolate root causes of friction.";
    } else {
        executiveDirective = "OPTIMAL: Engineering rhythm is stable. Continue high-intensity cycles with standard maintenance.";
    }
  }

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalCommits: stats.totalCommits || 0,
        repoCount: repoCount || 0,
        emotionalResonance: `${resonance}%`,
        avgSentiment: Math.round(stats.avgSentiment) || 0,
        avgBurnout: Math.round(stats.avgBurnout) || 0,
        topMood,
        starRepo: starRepo[0]?.repo?.name || 'Silent_System',
        peakDay: peakDayAgg[0] ? fullDays[peakDayAgg[0]._id - 1] : 'N/A',
        lateNightCommits: lateNight,
        cognitiveLoad: `${cognitiveLoad}%`,
        signalStability: `${signalStability}%`,
        linguisticPrecision: `${linguisticPrecision} wpc`,
        executiveDirective
      },
      repoList: repoList || [],
      recentCommits: recentCommits.map(c => ({
        ...c.toObject(),
        aiSummary: c.aiSummary || 'Signal parsed.',
        aiRecommendation: c.aiRecommendation || 'Maintain tempo.'
      })),
      heatmapData,
      chartData: formattedChart.length ? formattedChart : [
        { name: 'M', score: 50, load: 20 }, { name: 'T', score: 50, load: 20 }, { name: 'W', score: 50, load: 20 }
      ],
      syncStatus: req.user.syncStatus,
      lastSyncedAt: req.user.lastSyncedAt || new Date()
    },
  });
}));

/**
 * @route   POST /api/v1/data/reset
 * @desc    Factory Reset: Wipe all user repositories and commits
 * @access  Private
 */
router.post('/reset', protect, catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Wipe data matrices
  await Commit.deleteMany({ userId });
  await Repo.deleteMany({ userId });

  // Reset user sync state
  await User.findByIdAndUpdate(userId, { 
    syncStatus: 'idle', 
    lastSyncedAt: null 
  });

  res.status(200).json({
    success: true,
    message: 'SYSTEM_WIPED: All telemetry data has been purged.',
  });
}));

export default router;
