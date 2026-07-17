// Speech-to-text factory. Decoupled from the LLM provider — users configure
// their preferred STT provider separately in Audio / Transcription settings.
// Returns { text, provider } or { text:'', error }.
const { pcmToWav } = require('./wav');

// OpenAI-compatible providers: same API shape, different baseURL
const STT_ENDPOINTS = {
  openai: { baseURL: undefined, defaultModel: 'whisper-1' },
};

async function transcribeOpenAICompatible(apiKey, wav, model, label, baseURL) {
  const OpenAI = require('openai');
  const toFile = OpenAI.toFile || require('openai/uploads').toFile;
  const client = baseURL ? new OpenAI({ apiKey, baseURL }) : new OpenAI({ apiKey });
  const file = await toFile(wav, 'audio.wav', { type: 'audio/wav' });
  const res = await client.audio.transcriptions.create({ file, model: model || STT_ENDPOINTS[label]?.defaultModel || 'whisper-1' });
  return (res.text || '').trim();
}

async function transcribeGemini(apiKey, wav) {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [
      { text: 'Transcribe this audio verbatim. Return only the spoken words with no commentary. If there is no clear speech, return an empty response.' },
      { inlineData: { mimeType: 'audio/wav', data: wav.toString('base64') } }
    ] }]
  });
  return ((res && res.text) || '').trim();
}

async function transcribeNVIDIA(apiKey, wav, model) {
  const modelName = model || 'nvidia/parakeet-ctc-1.1b-en';
  const url = 'https://ai.api.nvidia.com/v1/nvidia/nemo/' + modelName.replace('nvidia/', '') + ':transcribe';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: wav.toString('base64'), encoding: 'wav', sample_rate: 16000 })
  });
  if (!response.ok) throw new Error('NVIDIA ASR error: ' + response.status);
  const data = await response.json();
  return ((data && data.text) || '').trim();
}

function suggestionMessage(expectedSTT) {
  const label = expectedSTT ? ' for "' + expectedSTT + '"' : '';
  const lines = [
    'Transcription unavailable' + label + ' — configure an audio provider in Settings → Audio / Transcription.',
    'Options:',
    '  • OpenAI Whisper (paid, ~$0.006/min) — add OpenAI key',
    '  • Gemini 2.5 Flash (free tier) — add Gemini key (or reuse chat key)',
    '  • NVIDIA Parakeet ASR (free, ~40 rpm) — free key at build.nvidia.com',
  ];
  return lines.join('\n');
}

function createSTT(settings) {
  const keys = settings.apiKeys || {};
  const chatProvider = settings.provider || 'openai';
  const sttProvider = (settings.sttProvider || 'auto').toLowerCase();
  const sttKey = settings.sttApiKey || '';
  const sttModel = settings.sttModel || '';
  const chain = [];

  function addOpenAI(key, m, label) {
    const ep = STT_ENDPOINTS[label] || STT_ENDPOINTS.openai;
    chain.push({ p: label, fn: (wav) => transcribeOpenAICompatible(key, wav, m || ep.defaultModel, label, ep.baseURL) });
  }
  function addGemini(key) {
    chain.push({ p: 'gemini', fn: (wav) => transcribeGemini(key, wav) });
  }
  function addNVIDIA(key, m) {
    chain.push({ p: 'nvidia', fn: (wav) => transcribeNVIDIA(key, wav, m) });
  }

  const VALID_STT = ['auto', 'openai', 'gemini', 'nvidia', 'deepgram'];

  if (sttProvider === 'auto') {
    // Derive from chat provider, then fall back
    if (chatProvider === 'openai' && keys.openai) {
      addOpenAI(keys.openai, sttModel, 'openai');
    } else if (chatProvider === 'gemini' && keys.gemini) {
      addGemini(keys.gemini);
    }
    // Fallback: OpenAI → Gemini → NVIDIA
    if (chatProvider !== 'openai' && keys.openai) addOpenAI(keys.openai, sttModel, 'openai');
    if (chatProvider !== 'gemini' && keys.gemini) addGemini(keys.gemini);
    if (keys.nvidia) addNVIDIA(keys.nvidia, sttModel);
  } else {
    if (!VALID_STT.includes(sttProvider)) {
      return {
        available: false,
        providers: [],
        suggestion: 'Unknown STT provider "' + sttProvider + '". Choose OpenAI, Gemini, or NVIDIA in Settings → Audio / Transcription.',
        async transcribe() { return { text: '', error: { message: 'Unknown STT provider: ' + sttProvider } }; }
      };
    }
    const key = sttKey || keys[sttProvider] || '';
    if (!key) {
      return {
        available: false,
        providers: [],
        suggestion: suggestionMessage(sttProvider),
        async transcribe() { return { text: '', error: { message: 'No API key for STT provider "' + sttProvider + '". Open Settings → Audio / Transcription to configure.' } }; }
      };
    }
    if (sttProvider === 'gemini') {
      addGemini(key);
    } else if (sttProvider === 'deepgram') {
      return {
        available: false,
        providers: [],
        suggestion: 'Deepgram support coming soon. Use OpenAI, Gemini, or NVIDIA for now.',
        async transcribe() { return { text: '', error: { message: 'Deepgram transcription is not yet implemented.' } }; }
      };
    } else if (sttProvider === 'nvidia') {
      addNVIDIA(key, sttModel);
    } else {
      // OpenAI-compatible (openai)
      addOpenAI(key, sttModel, sttProvider);
    }
  }

  return {
    available: chain.length > 0,
    providers: chain.map((c) => c.p),
    suggestion: chain.length ? '' : suggestionMessage(),
    async transcribe(pcm) {
      if (!chain.length || !pcm || pcm.length < 3200) return { text: '' };
      const wav = pcmToWav(pcm, 16000, 1);
      let lastErr = null;
      for (const c of chain) {
        try {
          const text = await c.fn(wav);
          return { text, provider: c.p };
        } catch (e) {
          lastErr = { status: e && e.status, code: e && e.code, message: (e && e.message) || String(e), provider: c.p };
        }
      }
      return { text: '', error: lastErr };
    }
  };
}

module.exports = { createSTT };