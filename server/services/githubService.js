import { Octokit } from 'octokit';
import Repo from '../models/Repo.model.js';
import Commit from '../models/Commit.model.js';
import User from '../models/User.model.js';
import { analyzeCommitSentiment, sleep } from './aiService.js';

/**
 * Initialize Octokit with user's access token
 * @param {string} token 
 * @returns {Octokit}
 */
export const getOctokit = (token) => {
  if (!token) return null;
  return new Octokit({ auth: token.trim() });
};

export const syncUserRepos = async (user) => {
  const octokit = getOctokit(user.githubAccessToken);
  if (!octokit) throw new Error('Octokit initialization failed: Missing token');

  console.log('[Sync] Verifying token viability...');
  try {
    const { data: ghUser } = await octokit.rest.users.getAuthenticated();
    console.log(`[Sync] Token verified for GH User: ${ghUser.login}`);
  } catch (err) {
    console.error('[Sync] Token verification FAILED:', err.message);
    throw new Error(`GitHub Authentication failed: ${err.message}`);
  }
  
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    visibility: 'all',
    per_page: 100,
    sort: 'pushed'
  });

  const syncedRepos = [];

  for (const repoData of repos) {
    const repo = await Repo.findOneAndUpdate(
      { githubRepoId: repoData.id },
      {
        userId: user._id,
        githubRepoId: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        isPrivate: repoData.private,
      },
      { upsert: true, new: true }
    );
    syncedRepos.push(repo);
  }

  return syncedRepos;
};

/**
 * Sync commits for a single repository (last 90 days)
 * @param {Object} user - User document
 * @param {Object} repo - Repo document
 */
export const syncRepoCommits = async (user, repo) => {
  const octokit = getOctokit(user.githubAccessToken);
  // Default lookback reduced to 30 days for faster relevance
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [owner, repoName] = repo.fullName.split('/');

  // Paginate commits from last 30 days
  const commits = await octokit.paginate(
    octokit.rest.repos.listCommits,
    {
      owner,
      repo: repoName,
      since: thirtyDaysAgo.toISOString(),
      per_page: 100,
    }
  );

  // Focus only on the most recent 40 signals per repo for maximum dashboard speed
  const priorityCommits = commits.slice(0, 40);

  const newCommits = [];

  for (const commitData of priorityCommits) {
    // Optimization: Check if commit already fully analyzed with telemetry
    const existingCommit = await Commit.findOne({ sha: commitData.sha });
    
    if (existingCommit && existingCommit.aiRecommendation && existingCommit.additions > 0) {
      newCommits.push(existingCommit);
      continue;
    }

    const timestamp = new Date(commitData.commit.author.date);
    const hour = timestamp.getHours();
    const isAfterHours = hour >= 22 || hour < 6;

    // AI Analysis only for new or unanalyzed signals
    const aiAnalysis = await analyzeCommitSentiment(commitData.commit.message);
    
    // Fetch detailed stats (additions/deletions) for richer telemetry
    let stats = { additions: 0, deletions: 0, filesChanged: 0 };
    try {
      const { data: detail } = await octokit.rest.repos.getCommit({
        owner,
        repo: repoName,
        ref: commitData.sha
      });
      stats = {
        additions: detail.stats.additions,
        deletions: detail.stats.deletions,
        filesChanged: detail.files.length
      };
    } catch (e) {
      // Fallback to defaults if detail fetch fails
    }

    await sleep(100); 

    const commit = await Commit.findOneAndUpdate(
      { sha: commitData.sha },
      {
        userId: user._id,
        repoId: repo._id,
        sha: commitData.sha,
        message: commitData.commit.message,
        timestamp,
        isAfterHours,
        sentimentScore: aiAnalysis.score,
        burnoutIndex: aiAnalysis.burnout,
        moodTag: aiAnalysis.vibe,
        aiSummary: aiAnalysis.briefing,
        aiRecommendation: aiAnalysis.recommendation,
        additions: stats.additions,
        deletions: stats.deletions,
        filesChanged: stats.filesChanged,
      },
      { upsert: true, new: true }
    );
    newCommits.push(commit);
  }

  // Update repository's lastCommitAt
  if (newCommits.length > 0) {
    const latestCommit = newCommits.reduce((latest, current) => 
      latest.timestamp > current.timestamp ? latest : current
    );
    await Repo.findByIdAndUpdate(repo._id, { lastCommitAt: latestCommit.timestamp });
  }

  return newCommits;
};

/**
 * Sync everything for a user (repos + commits)
 * @param {Object} user - User document
 */
export const syncAllForUser = async (userInput) => {
  try {
    const user = await User.findById(userInput._id);
    if (!user || !user.githubAccessToken) {
        throw new Error('User not found or GitHub token missing');
    }

    // Prevent duplicate syncs if already running (stale check: 15 mins)
    if (user.syncStatus === 'syncing' && user.updatedAt > new Date(Date.now() - 15 * 60 * 1000)) {
        console.log(`[Sync] Sync already in progress for ${user.username}. Skipping.`);
        return { success: true, message: 'Sync already in progress' };
    }

    console.log(`[Sync] Starting deep signal ingestion for user: ${user.username}`);

    // 1. Update user sync status
    await User.findByIdAndUpdate(user._id, { syncStatus: 'syncing' });

    // 2. Fetch and sync repos
    const repos = await syncUserRepos(user);

    // 3. Sync commits for each repo with controlled concurrency
    // We use a simple chunking to process 3 repos at a time to avoid GH secondary limits
    const repoChunks = [];
    for (let i = 0; i < repos.length; i += 3) {
      repoChunks.push(repos.slice(i, i + 3));
    }

    for (const chunk of repoChunks) {
      await Promise.all(chunk.map(repo => syncRepoCommits(user, repo)));
    }

    // 4. Update user sync status and lastSyncedAt
    await User.findByIdAndUpdate(user._id, { 
      syncStatus: 'idle', 
      lastSyncedAt: new Date() 
    });

    return { success: true };
  } catch (err) {
    const userId = userInput?._id || 'unknown';
    console.error(`[Sync] Error syncing user ${userId}:`, err.message);
    if (userInput?._id) {
      await User.findByIdAndUpdate(userInput._id, { syncStatus: 'error' });
    }
    throw err;
  }
};
