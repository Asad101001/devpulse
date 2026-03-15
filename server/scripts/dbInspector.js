import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import Repo from '../models/Repo.model.js';
import Commit from '../models/Commit.model.js';
import User from '../models/User.model.js';

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- DB INSPECTOR ---');

    const users = await User.countDocuments();
    const repos = await Repo.countDocuments();
    const commits = await Commit.countDocuments();

    console.log(`Users: ${users}`);
    console.log(`Repos: ${repos}`);
    console.log(`Commits: ${commits}`);

    if (commits > 0) {
      console.log('\n--- SAMPLE COMMIT ANALYZED BY AI ---');
      const sample = await Commit.findOne({ aiSummary: { $exists: true } }).populate('repoId');
      if (sample) {
        console.log(`Repo: ${sample.repoId.name}`);
        console.log(`Message: "${sample.message}"`);
        console.log(`AI Sentiment: ${sample.sentimentScore}%`);
        console.log(`AI Vibe: ${sample.moodTag}`);
        console.log(`AI Briefing: ${sample.aiSummary}`);
      }
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Inspection failed:', err.message);
  }
}

inspect();
