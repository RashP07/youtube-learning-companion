const { v4: uuidv4 } = require('uuid');
const { extractVideoId, isValidYouTubeUrl, getThumbnailUrl, fetchTranscript, fetchVideoMetadata } = require('../services/youtubeService');
const { generateAnalysis, normalizeAnalysis } = require('../services/aiService');
const { isDBConnected, Analysis } = require('../config/db');
const { createError } = require('../utils/errorHandler');

const analyzeVideo = async (req, res, next) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return next(createError('videoUrl is required', 400));
    }

    const trimmedUrl = videoUrl.trim();

    if (!isValidYouTubeUrl(trimmedUrl)) {
      return next(
        createError(
          'Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.',
          400
        )
      );
    }

    const videoId = extractVideoId(trimmedUrl);
    if (!videoId) {
      return next(createError('Could not extract video ID from the provided URL.', 400));
    }

    // Build canonical watch URL (handles youtu.be short links)
    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`[Analyze] Starting analysis for videoId: ${videoId}`);

    const transcript = await fetchTranscript(videoId);
    const metadata = await fetchVideoMetadata(videoId);

    if (transcript) {
      console.log('[Analyze] Transcript fetched — using transcript mode.');
    } else if (metadata?.title) {
      console.log(`[Analyze] No transcript — using video title: "${metadata.title}"`);
    } else {
      console.log('[Analyze] No transcript or metadata available.');
    }

    const rawAnalysis = await generateAnalysis(canonicalUrl, transcript, metadata);

    const analysis = normalizeAnalysis(rawAnalysis, videoId, canonicalUrl);
    analysis.thumbnail = getThumbnailUrl(videoId);

    if (isDBConnected()) {
      try {
        const saved = await Analysis.findOneAndUpdate(
          { videoId },
          { ...analysis },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        analysis._id = saved._id.toString();
        analysis.createdAt = saved.createdAt;
      } catch (dbError) {
        console.warn('[Analyze] MongoDB save failed:', dbError.message);
      }
    } else {
      analysis._id = uuidv4();
      analysis.createdAt = new Date().toISOString();
    }

    console.log(`[Analyze] Done — "${analysis.title}"`);

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeVideo };
