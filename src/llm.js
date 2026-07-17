// LLM factory — OpenAI / Anthropic / Gemini / Mistral / NVIDIA / Ollama / OpenRouter behind one streaming interface.
// stream({ system, turns:[{role,text}], imageDataUrl, maxTokens, onToken }) -> Promise<fullText>

function stripDataUrl(dataUrl) {
  const m = /^data:(.+?);base64,(.*)$/s.exec(dataUrl || '');
  return m ? { mime: m[1], b64: m[2] } : null;
}

// Build messages with image on last user turn (OpenAI-compatible format)
function buildMessages({ system, turns, imageDataUrl }) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  turns.forEach((t, i) => {
    const last = i === turns.length - 1;
    if (last && imageDataUrl && t.role === 'user') {
      messages.push({ role: 'user', content: [
        { type: 'text', text: t.text },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ] });
    } else {
      messages.push({ role: t.role, content: t.text });
    }
  });
  return messages;
}

async function streamOpenAI({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey });
  const messages = buildMessages({ system, turns, imageDataUrl });
  const stream = await client.chat.completions.create({ model, messages, stream: true, max_tokens: maxTokens });
  let full = '';
  for await (const part of stream) {
    const d = part.choices && part.choices[0] && part.choices[0].delta && part.choices[0].delta.content;
    if (d) { full += d; onToken(d); }
  }
  return full;
}

async function streamAnthropic({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });
  const messages = turns.map((t, i) => {
    const last = i === turns.length - 1;
    if (last && imageDataUrl && t.role === 'user') {
      const img = stripDataUrl(imageDataUrl);
      const content = [];
      if (img) content.push({ type: 'image', source: { type: 'base64', media_type: img.mime, data: img.b64 } });
      content.push({ type: 'text', text: t.text });
      return { role: 'user', content };
    }
    return { role: t.role, content: t.text };
  });
  const stream = await client.messages.create({ model, max_tokens: maxTokens, system, messages, stream: true });
  let full = '';
  for await (const ev of stream) {
    if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') { full += ev.delta.text; onToken(ev.delta.text); }
  }
  return full;
}

async function streamGemini({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const contents = turns.map((t, i) => {
    const last = i === turns.length - 1;
    const parts = [{ text: t.text }];
    if (last && imageDataUrl && t.role === 'user') {
      const img = stripDataUrl(imageDataUrl);
      if (img) parts.push({ inlineData: { mimeType: img.mime, data: img.b64 } });
    }
    return { role: t.role === 'assistant' ? 'model' : 'user', parts };
  });
  const stream = await ai.models.generateContentStream({
    model, contents, config: { systemInstruction: system, maxOutputTokens: maxTokens }
  });
  let full = '';
  for await (const chunk of stream) {
    const t = chunk && chunk.text;
    if (t) { full += t; onToken(t); }
  }
  return full;
}

async function streamMistral({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const url = 'https://api.mistral.ai/v1/chat/completions';
  const messages = buildMessages({ system, turns, imageDataUrl });
  
  const payload = { model, messages, max_tokens: maxTokens, stream: true };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`Mistral API error: ${response.status}`);
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0]?.delta?.content;
          if (delta) { full += delta; onToken(delta); }
        } catch (e) {}
      }
    }
  }
  return full;
}

async function streamNvidia({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const messages = buildMessages({ system, turns, imageDataUrl });
  
  const payload = { model, messages, max_tokens: maxTokens, stream: true };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`NVIDIA API error: ${response.status}`);
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0]?.delta?.content;
          if (delta) { full += delta; onToken(delta); }
        } catch (e) {}
      }
    }
  }
  return full;
}

async function streamOllama({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const url = 'http://localhost:11434/api/chat';
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  turns.forEach((t, i) => {
    const last = i === turns.length - 1;
    const msg = { role: t.role, content: t.text };
    if (last && imageDataUrl && t.role === 'user') {
      const img = stripDataUrl(imageDataUrl);
      if (img) msg.images = [img.b64];
    }
    messages.push(msg);
  });
  
  const payload = { model, messages, options: { num_predict: maxTokens }, stream: true };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const msg = parsed.message?.content;
        if (msg) { full += msg; onToken(msg); }
      } catch (e) {}
    }
  }
  return full;
}

async function streamOpenRouter({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const messages = buildMessages({ system, turns, imageDataUrl });
  
  const payload = { model, messages, max_tokens: maxTokens, stream: true };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0]?.delta?.content;
          if (delta) { full += delta; onToken(delta); }
        } catch (e) {}
      }
    }
  }
  return full;
}

async function streamCustom({ apiKey, baseURL, model, system, turns, imageDataUrl, maxTokens, onToken }) {
  const url = (baseURL || 'https://api.openai.com').replace(/\/+$/, '') + '/v1/chat/completions';
  const messages = buildMessages({ system, turns, imageDataUrl });

  const payload = { model, messages, max_tokens: maxTokens, stream: true };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(`Custom provider API error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0]?.delta?.content;
          if (delta) { full += delta; onToken(delta); }
        } catch (e) {}
      }
    }
  }
  return full;
}

async function withRetry(fn, maxRetries) {
  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      const retryable = e && (e.status === 429 || (e.status >= 500 && e.status < 600));
      if (!retryable || i >= maxRetries) throw lastErr;
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000 + Math.random() * 500));
    }
  }
  throw lastErr;
}
function createLLM(settings) {
  const provider = settings.provider;
  const keys = settings.apiKeys || {};
  const apiKey = keys[provider];
  const models = settings.models || {};
  const tier = settings.smart ? 'smart' : 'fast';

  let model;
  let baseURL = null;
  if (provider === 'custom') {
    model = (models.custom || {}).model;
    baseURL = (models.custom || {}).baseURL || '';
  } else {
    model = (models[provider] || {})[tier];
  }
  
  const maxTokens = settings.smart ? 3200 : 1400;

  return {
    provider, model, apiKey,
    ready: !!apiKey && !!model,
    async stream(params) {
      const args = { apiKey, model, maxTokens, baseURL, ...params };
      const dispatch = async () => {
        if (provider === 'custom') return streamCustom(args);
        if (provider === 'openai') return streamOpenAI(args);
        if (provider === 'anthropic') return streamAnthropic(args);
        if (provider === 'gemini') return streamGemini(args);
        if (provider === 'mistral') return streamMistral(args);
        if (provider === 'nvidia') return streamNvidia(args);
        if (provider === 'ollama') return streamOllama(args);
        if (provider === 'openrouter') return streamOpenRouter(args);
        throw new Error('unknown provider: ' + provider);
      };
      return withRetry(dispatch, 2);
    }
  };
};

module.exports = { createLLM };
