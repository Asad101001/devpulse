import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { syncAllForUser } from '../services/githubService.js';
import Commit from '../models/Commit.model.js';
import Repo from '../models/Repo.model.js';
import User from '../models/User.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateExecutiveDirective } from '../services/aiService.js';

const router = express.Router();

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

router.get('/stats', protect, catchAsync(async (req, res) => {
  const userId = req.user._id;
  const totalCommitsCount = await Commit.countDocuments({ userId });
  
  // Auto-trigger sync if new user or data empty
  if (totalCommitsCount === 0 && req.user.syncStatus === 'idle') {
    syncAllForUser(req.user).catch(() => {});
  }

  // Fetch global count for simple metrics
  const globalCount = await Commit.countDocuments({ userId });

  // Advanced Aggregation for RELEVANT stats (Last 100 Signals)
  const advancedStats = await Commit.aggregate([
    { $match: { userId } },
    { $sort: { timestamp: -1 } },
    { $limit: 100 },
    {
      $group: {
        _id: null,
        avgSentiment: { $avg: "$sentimentScore" },
        avgBurnout: { $avg: "$burnoutIndex" },
        sampleSize: { $count: {} },
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
    sampleSize: 0, 
    avgAdditions: 0, 
    avgDeletions: 0, 
    avgFilesChanged: 0, 
    moodTags: [],
    sentimentStdDev: 0,
    messages: []
  };

  // Calculate Linguistic Precision (avg word count) - Recent Relevancy
  const totalWords = stats.messages.reduce((acc, msg) => acc + (msg?.split(/\s+/)?.length || 0), 0);
  const linguisticPrecision = stats.sampleSize > 0 ? Math.round(totalWords / stats.sampleSize) : 0;

  // Calculate Cognitive Load Score (0-100 normalized)
  // Higher additions/deletions and files changed = higher load
  const rawLoad = (stats.avgAdditions + stats.avgDeletions) / 10 + (stats.avgFilesChanged * 5);
  const cognitiveLoad = Math.min(Math.round(rawLoad), 100);

  // Calculate Signal Stability (100 - stdDev)
  const signalStability = Math.max(Math.round(100 - (stats.sentimentStdDev || 0)), 0);

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

  const moodCounts = stats.moodTags.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.keys(moodCounts).sort((a,b) => moodCounts[b] - moodCounts[a])[0] || 'Unknown';
  const resonance = stats.totalCommits > 0 ? Math.round((moodCounts[topMood] / stats.totalCommits) * 100) : 0;

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

  const statsSummary = `RECENT_RELEVANCY_MATRIX: Sample_Size: ${stats.sampleSize}, Avg_Sentiment: ${stats.avgSentiment}%, Avg_Burnout: ${stats.avgBurnout}%, Cognitive_Load: ${cognitiveLoad}%, Latest_Messages: ${stats.messages.slice(0, 5).join('; ')}`;
  const executiveDirective = await generateExecutiveDirective(statsSummary);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalCommits: globalCount || 0,
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
