const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function callOpenRouter(systemPrompt, userMessage, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

  if (!apiKey || !apiKey.trim() || apiKey === 'your-openrouter-api-key') {
    const err = new Error('OpenRouter API key not configured (set OPENROUTER_API_KEY)');
    err.statusCode = 503;
    throw err;
  }

  const messages = options.messages || [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  const body = JSON.stringify({
    model,
    messages,
    max_tokens: options.maxTokens || 2000,
    temperature: options.temperature || 0.7
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Sales Training Simulator'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            resolve(parsed.choices?.[0]?.message?.content || 'No response generated.');
          }
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * 3-strategy JSON parser for AI responses
 */
function parseAIJson(text) {
  if (!text) throw new Error('Empty AI response');

  // Strategy 1: Direct parse
  try { return JSON.parse(text); } catch (_) {}

  // Strategy 2: Strip markdown fences
  try {
    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(stripped);
  } catch (_) {}

  // Strategy 3: Extract first JSON object or array
  try {
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[0]);
  } catch (_) {}

  throw new Error('Failed to parse AI response as JSON');
}

module.exports = { callOpenRouter, parseAIJson };
