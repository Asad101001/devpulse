import mongoose from 'mongoose';

const { Schema } = mongoose;

const RepoSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  githubRepoId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  language: {
    type: String,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  lastCommitAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

RepoSchema.index({ userId: 1 });

const Repo = mongoose.model('Repo', RepoSchema);

export default Repo;
