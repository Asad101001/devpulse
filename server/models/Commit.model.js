import mongoose from 'mongoose';

const { Schema } = mongoose;

const CommitSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repoId: {
    type: Schema.Types.ObjectId,
    ref: 'Repo',
    required: true,
  },
  sha: {
    type: String,
    required: true,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  additions: {
    type: Number,
    default: 0,
  },
  deletions: {
    type: Number,
    default: 0,
  },
  filesChanged: {
    type: Number,
    default: 0,
  },
  isAfterHours: {
    type: Boolean,
    default: false,
    // computed: hour >= 22 || hour < 6
  },
  sentimentScore: {
    type: Number, // -1 to 1 or 0 to 100
  },
  burnoutIndex: {
    type: Number, // 0 to 100
  },
  moodTag: {
    type: String, // 'frustrated', 'productive', 'tired', etc.
  },
  aiSummary: {
    type: String,
  },
}, {
  timestamps: true,
});

CommitSchema.index({ userId: 1, timestamp: -1 });
CommitSchema.index({ repoId: 1 });

const Commit = mongoose.model('Commit', CommitSchema);

export default Commit;
