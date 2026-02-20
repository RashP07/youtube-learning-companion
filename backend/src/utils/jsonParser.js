/**
 * Safely parse JSON from AI response, stripping markdown fences if needed.
 */
const safeParseJSON = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid AI response: empty or non-string output');
  }

  let cleaned = text.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  // Strip any leading/trailing non-JSON characters
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No valid JSON object found in AI response');
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`JSON parse error: ${e.message}`);
  }
};

module.exports = { safeParseJSON };
