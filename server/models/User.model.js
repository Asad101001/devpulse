import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  githubId: {
    type: String,
    required: [true, 'GitHub ID is required'],
    unique: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
  displayName: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
  email: {
    type: String,
  },
  githubAccessToken: {
    type: String,
  },
  lastSyncedAt: {
    type: Date,
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'error'],
    default: 'idle',
  },
  lastReportAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

export default User;
