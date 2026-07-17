<div align="center">

# OpenCluely

**A free, open-source AI copilot that sees your screen, hears your meetings, and stays invisible while it does it.**

Bring your own AI key — OpenAI · Anthropic · Gemini · Mistral · NVIDIA · Ollama · OpenRouter · Custom

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)](#quick-start)
[![Stars](https://img.shields.io/github/stars/rahulcvwebsitehosting/OpenCluely?style=social)](https://github.com/rahulcvwebsitehosting/OpenCluely)

<img src="docs/tutorial.png" width="620" alt="OpenCluely first-run tutorial" />

</div>

---

## What it does

A small glass panel floats over everything on your screen. It reads **three inputs** — your screen, your microphone, and the audio from your call — and uses any AI model you connect to help you in real time. It's excluded from screen-share and screen-recording capture on macOS, so it's visible to you and invisible to everyone else on the call. On Windows, position it in a corner where it won't obstruct your work.

| Feature | Windows | macOS | What it uses |
|---|---|---|---|
| **Assist** — do the smart thing right now | `Ctrl` + `Enter` | `⌘` + `↵` | screen + conversation |
| **What should I say?** | button | button | meeting audio |
| **Follow-up questions** | button | button | conversation |
| **Recap** — catch up a late joiner | button | button | conversation |
| **Solve coding problem** | `Ctrl` + `H` | `⌘` + `H` | screen only |
| **Settings** | `Ctrl` + `,` | `⌘` + `,` | — |
| **Quit** | `Ctrl` + `Shift` + `X` | `⌘` + `⇧` + `X` | — |

## Quick start

### Windows

1. Go to [Releases](https://github.com/rahulcvwebsitehosting/OpenCluely/releases) and download `OpenCluely-Windows-x64.zip`
2. Extract the zip and run `OpenCluely.exe`
3. Open Settings (`Ctrl` + `,`), pick a provider, paste your API key
4. Press `Ctrl` + `Enter` to assist with whatever's on screen

### macOS

1. Download from [Releases](https://github.com/rahulcvwebsitehosting/OpenCluely/releases) or run from source:
   ```bash
   git clone https://github.com/rahulcvwebsitehosting/OpenCluely.git
   cd OpenCluely
   npm install && npm start
   ```
2. Open Settings (`⌘` + `,`), pick a provider, paste your API key
3. Press `⌘` + `↵` to assist with whatever's on screen

> **macOS first open:** Right-click `OpenCluely.app` → Open → click Open. If told it's damaged, run `xattr -cr /Applications/OpenCluely.app` in Terminal once.

### Building from source (any platform)

```bash
git clone https://github.com/rahulcvwebsitehosting/OpenCluely.git
cd OpenCluely
npm install
npm start
```

## Why OpenCluely?

- **Free.** No subscriptions, no accounts, no telemetry.
- **Your keys.** Bring your own API key from any provider — you pay the provider directly, nothing marked up.
- **Local models.** Point it at Ollama and run the whole thing offline.
- **Private.** Keys and settings live in a local JSON file. No servers, no analytics, no data leaves your machine except to the AI provider you chose.
- **Custom.** Add any OpenAI-compatible endpoint.
- **Open source.** GPL-3.0. Read the code, fork it, change it.

## Getting API keys

| Provider | How to get a key |
|---|---|
| **OpenAI** | Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys), click **Create new secret key**. For listening features the key must have Whisper/audio access. |
| **Anthropic** | Go to [console.anthropic.com](https://console.anthropic.com), sign up, navigate to **API Keys** and create one. |
| **Gemini** | Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), click **Get API key**. One key works for both chat and transcription. |
| **Mistral** | Go to [console.mistral.ai](https://console.mistral.ai), create an account, go to **API Keys** and generate a key. |
| **NVIDIA** | Go to [build.nvidia.com](https://build.nvidia.com), sign in, select any model and click **Get API Key**. |
| **Ollama** | No key needed. [Download Ollama](https://ollama.ai), run it locally, pull a model (e.g. `ollama pull llama3.2`). |
| **OpenRouter** | Go to [openrouter.ai/keys](https://openrouter.ai/keys), sign in and create a key. Single key gives access to 400+ models. |
| **Custom** | Any OpenAI-compatible endpoint. Enter the base URL, model name, and API key in the Custom provider settings. |

## How it stays invisible

- **macOS:** Uses `setContentProtection` to exclude its window from screen capture — the OS-level API that keeps DRM content hidden also hides OpenCluely from Zoom, Meet, OBS, and screen-recording software. You see it; a screen share doesn't.
- **Windows:** Uses standard window management. OpenCluely stays on top of other windows but may appear in screen recordings. For the best experience in meetings, position the panel in a corner or use Zoom's "Advanced capture with window filtering" setting (Zoom → Settings → Share Screen → Advanced → Screen capture mode).

## A note on how you use this

OpenCluely is a general-purpose "see my screen, hear my call" AI tool — it doesn't know or care whether you're using it to keep pace in a fast-moving standup, practice for an interview, or get a live assist during a call. That judgment call is yours. Using it to misrepresent your own skills or knowledge in a context where you're expected to demonstrate them yourself (a graded exam, a job interview you're expected to pass unaided) is on you, not the tool.

## Contributing

Issues and PRs welcome. The codebase is small and readable on purpose:

```
main.js         → Electron main process, IPC, window/overlay behavior
preload.js      → renderer bridge
src/llm.js      → provider abstraction (OpenAI/Anthropic/Gemini/Mistral/NVIDIA/Ollama/OpenRouter)
src/prompts.js  → the actual prompts behind each mode
src/stt.js      → speech-to-text
src/screen.js   → screenshot capture
src/store.js    → local settings persistence
renderer/       → UI
```

## Creator

Built by [Rahul Shyam](https://rahulshyam-portfolio.vercel.app/)

| Platform | Link |
|---|---|
| LinkedIn | https://linkedin.com/in/rahulshyamcivil |
| X / Twitter | https://x.com/RahulShyamCV |
| Threads | https://threads.com/@rahulcvjps |
| GitHub | https://github.com/rahulcvwebsitehosting |

## License

[GPL-3.0-or-later](LICENSE) — free to use, modify, and share.
