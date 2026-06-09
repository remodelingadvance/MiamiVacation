import logger from '../utils/logger.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text).filter(Boolean).join('\n').trim();
};

export const generateGeminiAnswer = async ({ prompt, model, temperature = 0.15, maxOutputTokens = 1400 }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const selectedModel = model || process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey) {
    return {
      text: 'AI support is not configured yet. Please choose Ask Admin and our team will help you.',
      model: selectedModel,
      configured: false,
      raw: null,
    };
  }

  const response = await fetch(`${GEMINI_API_BASE}/models/${selectedModel}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature,
        topP: 0.8,
        maxOutputTokens,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    logger.error('Gemini API request failed:', {
      status: response.status,
      message: data?.error?.message,
    });
    throw new Error('AI assistant is temporarily unavailable. Please try Ask Admin.');
  }

  return {
    text: extractGeminiText(data),
    model: selectedModel,
    configured: true,
    raw: data,
  };
};
