const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { safeParseJSON } = require('../utils/jsonParser');


let _groq = null;
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) return null;
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

let _genAI = null;
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!_genAI) _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
};

// ── Prompts ────────────────────────────────────────────────────────────────

const JSON_STRUCTURE = `{"title":"Full video title","summary":"5-8 sentence comprehensive summary","keyTakeaways":["point 1","point 2","point 3","point 4","point 5"],"notes":[{"timestamp":"00:00","text":"Note text here"},{"timestamp":"02:30","text":"Another note"}],"quiz":[{"question":"Question text?","options":["A. Option 1","B. Option 2","C. Option 3","D. Option 4"],"answer":"B","explanation":"Why B is correct"}],"flashcards":[{"front":"What is X?","back":"X is..."}]}`;

const buildTranscriptPrompt = (transcript, videoUrl) => `
You are an expert educational content analyzer. Below is the full transcript of a YouTube video.

Video URL: ${videoUrl}

Transcript:
"""
${transcript.slice(0, 12000)}
"""

Generate structured study materials from this transcript. Return ONLY valid JSON — no markdown fences, no extra text.

Requirements:
- title: descriptive title based on the transcript content
- summary: 5-8 comprehensive sentences covering main ideas
- keyTakeaways: 5-10 key learning points as strings
- notes: 10-20 timestamped notes (use realistic time estimates based on transcript position)
- quiz: 8-12 MCQ questions, options as "A. text", "B. text" etc., answer as single letter "A"/"B"/"C"/"D"
- flashcards: 8-15 Q&A cards for key concepts

JSON structure to follow:
${JSON_STRUCTURE}

Return ONLY the JSON object starting with { and ending with }.
`.trim();

const buildVideoPrompt = (videoUrl) => `
You are an expert educational content analyzer. Carefully analyze this YouTube video.

Video URL: ${videoUrl}

Generate structured study materials. Return ONLY valid JSON — no markdown fences, no extra text.

Requirements:
- title: exact or descriptive title of the video
- summary: 5-8 comprehensive sentences covering main ideas
- keyTakeaways: 5-10 key learning points as strings
- notes: 10-20 timestamped notes
- quiz: 8-12 MCQ questions, options as "A. text"/"B. text" etc., answer as single letter
- flashcards: 8-15 Q&A cards for key concepts

JSON structure:
${JSON_STRUCTURE}

Return ONLY the JSON object starting with { and ending with }.
`.trim();

const buildMetadataPrompt = (title, author, videoUrl) => `
You are an expert educational content creator. Generate comprehensive study materials for the following YouTube video.

Video Title: "${title}"
Channel: ${author}
Video URL: ${videoUrl}

Based on the video title and topic, generate detailed study materials covering the key concepts that would be taught in this video. Return ONLY valid JSON — no markdown fences, no extra text.

Requirements:
- title: use the exact video title provided above
- summary: 5-8 sentences explaining what this topic covers and why it matters
- keyTakeaways: 5-10 key learning points someone would gain from studying this topic
- notes: 10-20 topic notes with estimated timestamps (start at 00:00)
- quiz: 8-12 MCQ questions testing knowledge of this topic, options as "A. text"/"B. text" etc., answer as single letter
- flashcards: 8-15 Q&A cards for key concepts of this topic

JSON structure:
${JSON_STRUCTURE}

Return ONLY the JSON object starting with { and ending with }.
`.trim();


const tryGroq = async (prompt) => {
  const groq = getGroq();
  if (!groq) throw new Error('GROQ_API_KEY not configured');

  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

  for (const model of models) {
    try {
      console.log(`[Groq] Trying ${model}...`);
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 8192,
      });

      const text = completion.choices[0]?.message?.content || '';
      if (!text || text.trim().length < 50) throw new Error('Response too short');

      const parsed = safeParseJSON(text);
      if (!parsed.title && !parsed.summary) throw new Error('Missing required fields');

      console.log(`[Groq] Success with ${model}`);
      return parsed;
    } catch (err) {
      console.warn(`[Groq] ${model} failed:`, err.message?.substring(0, 120));
      if (err.message?.includes('rate_limit') || err.message?.includes('429')) continue;
      throw err;
    }
  }

  throw new Error('All Groq models failed');
};

// ── Gemini (fallback) ──────────────────────────────────────────────────────

const tryGemini = async (videoUrl, transcript) => {
  const client = getGenAI();
  if (!client) throw new Error('GEMINI_API_KEY not configured');

  const modelsToTry = transcript
    ? [
        { name: 'gemini-1.5-flash', useFileData: false },
        { name: 'gemini-1.5-pro', useFileData: false },
        { name: 'gemini-2.0-flash', useFileData: false },
      ]
    : [
        { name: 'gemini-1.5-flash', useFileData: true },
        { name: 'gemini-1.5-flash', useFileData: false },
        { name: 'gemini-1.5-pro', useFileData: false },
        { name: 'gemini-2.0-flash', useFileData: false },
      ];

  const prompt = transcript
    ? buildTranscriptPrompt(transcript, videoUrl)
    : buildVideoPrompt(videoUrl);

  let lastError = null;

  for (const { name, useFileData } of modelsToTry) {
    try {
      console.log(`[Gemini] Trying ${name} (fileData=${useFileData})...`);
      const model = client.getGenerativeModel({
        model: name,
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
      });

      let result;
      if (useFileData) {
        result = await model.generateContent([
          { fileData: { mimeType: 'video/*', fileUri: videoUrl } },
          buildVideoPrompt(videoUrl),
        ]);
      } else {
        result = await model.generateContent(prompt);
      }

      const text = result.response.text();
      if (!text || text.trim().length < 50) throw new Error('Response too short');

      const parsed = safeParseJSON(text);
      if (!parsed.title && !parsed.summary) throw new Error('Missing required fields');

      console.log(`[Gemini] Success with ${name}`);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini] ${name} failed:`, err.message?.substring(0, 120));
      lastError = err;

      if (err.message?.includes('429') && err.message?.includes('free_tier')) {
        console.error('[Gemini] Free-tier quota exhausted.');
        break;
      }
    }
  }

  const isQuota = lastError?.message?.includes('429') || lastError?.message?.includes('quota');
  if (isQuota) {
    throw new Error(
      'Gemini API quota exhausted. Get a free Groq key at console.groq.com and add GROQ_API_KEY to your .env file.'
    );
  }
  throw lastError || new Error('All Gemini models failed');
};

// ── Main entry point ───────────────────────────────────────────────────────

/**
 * Generate analysis — tries Groq first (free, generous quota), then Gemini as fallback.
 *
 * @param {string} videoUrl
 * @param {string|null} transcript
 * @returns {Promise<object>}
 */
/**
 * @param {string} videoUrl
 * @param {string|null} transcript
 * @param {{title:string, author:string}|null} metadata — from oEmbed, used when no transcript
 */
const generateAnalysis = async (videoUrl, transcript = null, metadata = null) => {
  // ── Path 1: Transcript available → Groq (text, fast, free) ──
  if (transcript) {
    const prompt = buildTranscriptPrompt(transcript, videoUrl);

    if (process.env.GROQ_API_KEY) {
      try {
        return await tryGroq(prompt);
      } catch (err) {
        console.warn('[AI] Groq failed, falling back to Gemini:', err.message?.substring(0, 100));
      }
    }

    if (process.env.GEMINI_API_KEY) {
      return await tryGemini(videoUrl, transcript);
    }

    throw new Error('No provider configured. Add GROQ_API_KEY (free at console.groq.com) to your .env file.');
  }

  // ── Path 2: No transcript but have metadata → Groq with title-based prompt ──
  if (metadata?.title && process.env.GROQ_API_KEY) {
    console.log(`[AI] No transcript — using video title "${metadata.title}" with Groq.`);
    const prompt = buildMetadataPrompt(metadata.title, metadata.author, videoUrl);
    try {
      return await tryGroq(prompt);
    } catch (err) {
      console.warn('[AI] Groq metadata mode failed:', err.message?.substring(0, 100));
    }
  }

  // ── Path 3: No transcript, no Groq → Gemini video mode (can watch YouTube) ──
  if (process.env.GEMINI_API_KEY) {
    console.log('[AI] Falling back to Gemini video mode.');
    return await tryGemini(videoUrl, null);
  }

  throw new Error(
    'This video has no captions/transcript. Add GROQ_API_KEY (free at console.groq.com) to your .env file to enable topic-based analysis.'
  );
};

/**
 * Normalize AI output into a consistent shape.
 */
const normalizeAnalysis = (raw, videoId, videoUrl) => ({
  videoId,
  videoUrl,
  title: (raw.title || 'Video Analysis').trim(),
  summary: (raw.summary || 'Summary not available.').trim(),
  keyTakeaways: Array.isArray(raw.keyTakeaways)
    ? raw.keyTakeaways.filter(Boolean).map(String)
    : [],
  notes: Array.isArray(raw.notes)
    ? raw.notes
        .map((n) => ({ timestamp: (n.timestamp || '00:00').trim(), text: (n.text || '').trim() }))
        .filter((n) => n.text)
    : [],
  quiz: Array.isArray(raw.quiz)
    ? raw.quiz
        .map((q) => ({
          question: (q.question || '').trim(),
          options: Array.isArray(q.options) ? q.options.map(String) : [],
          answer: ((q.answer || 'A').trim().toUpperCase() + 'A').charAt(0),
          explanation: (q.explanation || '').trim(),
        }))
        .filter((q) => q.question)
    : [],
  flashcards: Array.isArray(raw.flashcards)
    ? raw.flashcards
        .map((f) => ({ front: (f.front || '').trim(), back: (f.back || '').trim() }))
        .filter((f) => f.front && f.back)
    : [],
});

module.exports = { generateAnalysis, normalizeAnalysis };
