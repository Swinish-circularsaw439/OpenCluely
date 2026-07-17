// Simple JSON-file settings store (avoids native modules so `npm install` stays clean).
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const FILE = path.join(app.getPath('userData'), 'opencluely-data.json');

const DEFAULTS = {
  provider: 'openai',
  smart: false,
  apiKeys: { openai: '', anthropic: '', gemini: '' },
  models: {
    openai: { fast: 'gpt-5.1-mini', smart: 'gpt-5.1' },
    anthropic: { fast: 'claude-haiku-4-5', smart: 'claude-sonnet-4-6' },
    gemini: { fast: 'gemini-2.5-flash', smart: 'gemini-2.5-pro' },
    mistral: { fast: 'mistral-small-latest', smart: 'mistral-large-latest' },
    nvidia: { fast: 'nvidia/llama-3.3-nemotron-super-49b-v1', smart: 'nvidia/llama-3.1-nemotron-ultra-253b-v1' },
    ollama: { fast: 'llama3.2', smart: 'llama3.2' },
    openrouter: { fast: 'openrouter/auto', smart: 'openrouter/auto' },
    custom: { model: '', baseURL: '' }
  },
  customProviders: [],
  sttProvider: '',
  sttModel: '',
  sttApiKey: ''
};

let data = null;

function deepMerge(base, over) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(over || {})) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && typeof base[k] === 'object') {
      out[k] = deepMerge(base[k], over[k]);
    } else {
      out[k] = over[k];
    }
  }
  return out;
}

function load() {
  if (data) return data;
  try { data = deepMerge(DEFAULTS, JSON.parse(fs.readFileSync(FILE, 'utf8'))); }
  catch { data = deepMerge(DEFAULTS, {}); }
  return data;
}
function save() { try { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); } catch (e) { /* ignore */ } }

module.exports = {
  getSettings() { return load(); },
  setSettings(patch) { load(); data = deepMerge(data, patch || {}); save(); return data; }
};
