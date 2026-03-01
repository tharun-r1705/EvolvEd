// backend/src/utils/groq.js
// Groq AI client with multi-key round-robin rotation and retry logic

'use strict';

const Groq = require('groq-sdk');
const config = require('../config');

if (!config.groq.apiKeys.length) {
  console.warn('[Groq] No API keys configured. AI features will not work.');
}

// Create one client per key
const clients = config.groq.apiKeys.map((key) => new Groq({ apiKey: key }));
let currentKeyIndex = 0;

/**
 * Get the next Groq client (round-robin)
 */
function getClient() {
  if (!clients.length) throw new Error('No Groq API keys configured.');
  const client = clients[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % clients.length;
  return client;
}

/**
 * Call Groq chat completions with automatic key rotation on rate limit
 * @param {object} params - Groq chat completion params
 * @param {number} retries - Max retries (default: clients.length)
 * @returns {Promise<object>} Groq completion response
 */
async function groqChat(params, retries = clients.length || 1) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const client = getClient();
      const response = await client.chat.completions.create(params);
      return response;
    } catch (err) {
      lastError = err;
      // Rotate on rate limit (429) or overload (503)
      if (err.status === 429 || err.status === 503) {
        console.warn(`[Groq] Key ${currentKeyIndex} rate limited, rotating...`);
        // Small backoff before retry
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

module.exports = { groqChat };
