import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email', 'repo'], // 'repo' for private repos
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await User.findOne({ githubId: profile.id });

      console.log(`[Passport] Received token for ${profile.username}, length: ${accessToken?.length}`);

      const userData = {
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile._json.avatar_url,
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
        githubAccessToken: accessToken,
      };

      if (user) {
        // Update existing user
        user = await User.findByIdAndUpdate(user._id, userData, { new: true });
      } else {
        // Create new user
        user = await User.create(userData);
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

export default passport;
