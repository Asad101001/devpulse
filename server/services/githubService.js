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
  if (!token) {
    console.error('[Octokit] Cannot initialize: Token is missing');
    return null;
  }
  console.log('[Octokit] Initializing with token (length:', token.length, ')');
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
  
  console.log('[Sync] Fetching repositories for user...');
  
  // List all repositories where user is an owner or collaborator
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    visibility: 'all',
    per_page: 100,
  });

  console.log(`[Sync] Found ${repos.length} repositories.`);

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
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  const [owner, repoName] = repo.fullName.split('/');

  // Paginate all commits from last 90 days
  const commits = await octokit.paginate(
    octokit.rest.repos.listCommits,
    {
      owner,
      repo: repoName,
      since: ninetyDaysAgo.toISOString(),
      per_page: 100,
    }
  );

  const newCommits = [];

  for (const commitData of commits) {
    const timestamp = new Date(commitData.commit.author.date);
    const hour = timestamp.getHours();
    const isAfterHours = hour >= 22 || hour < 6;

    // AI Analysis
    const aiAnalysis = await analyzeCommitSentiment(commitData.commit.message);
    await sleep(500); // Respect Groq rate limits

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

    console.log(`[Sync] Starting sync for user: ${user.username}`);

    // 1. Update user sync status
    await User.findByIdAndUpdate(user._id, { syncStatus: 'syncing' });

    // 2. Fetch and sync repos
    const repos = await syncUserRepos(user);

    // 3. Sync commits for each repo
    for (const repo of repos) {
      await syncRepoCommits(user, repo);
    }

    // 4. Update user sync status and lastSyncedAt
    await User.findByIdAndUpdate(user._id, { 
      syncStatus: 'idle', 
      lastSyncedAt: new Date() 
    });

    return { success: true };
  } catch (err) {
    console.error(`[Sync] Error syncing user ${user.username}:`, err.message);
    await User.findByIdAndUpdate(user._id, { syncStatus: 'error' });
    throw err;
  }
};
