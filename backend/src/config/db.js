const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('MongoDB URI not set. Running without database (localStorage mode only).');
    return;
  }

  if (isConnected) return;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection failed. Running without database:', error.message);
  }
};

const isDBConnected = () => isConnected;

// Analysis Schema
const analysisSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true, index: true },
    videoUrl: { type: String, required: true },
    title: { type: String, default: 'Untitled Video' },
    summary: { type: String, default: '' },
    keyTakeaways: [String],
    notes: [
      {
        timestamp: String,
        text: String,
      },
    ],
    quiz: [
      {
        question: String,
        options: [String],
        answer: String,
        explanation: String,
      },
    ],
    flashcards: [
      {
        front: String,
        back: String,
      },
    ],
    thumbnail: { type: String, default: '' },
  },
  { timestamps: true }
);

const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

module.exports = { connectDB, isDBConnected, Analysis };
