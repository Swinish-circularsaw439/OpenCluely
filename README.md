<div align="center">

# OpenCluely

**An open-source AI copilot that floats over your screen — sees what you see, hears your meetings, and stays hidden from screen shares.**

A free, self-hosted alternative to Cluely. Bring your own AI key (OpenAI · Anthropic · Google Gemini · Mistral · NVIDIA · Ollama · OpenRouter).

<img src="docs/tutorial.png" width="620" alt="OpenCluely first-run tutorial" />

</div>

---

> [!IMPORTANT]
> **Please read this first.** OpenCluely tries to stay out of screen recordings/shares, but this is **best-effort, not guaranteed** — on macOS 15.4+ Apple can let modern capture tools see it anyway, and a phone camera always can. Using a hidden assistant during a **proctored exam, job interview, or recorded meeting** may break that platform's rules and, in some places, consent laws. OpenCluely is built for legitimate uses — your own notes, studying, accessibility, and practice. **You are responsible for how you use it.**
>
> On Zoom specifically, whether OpenCluely is hidden depends on one setting — **Settings → Share Screen → Screen capture mode → "Advanced capture with window filtering."**
>
> <img src="docs/zoom-capture-mode.png" width="560" alt="Zoom Settings → Share Screen → Screen capture mode set to Advanced capture with window filtering" />

---

## What it does

OpenCluely floats a small glass panel on top of everything. It takes **three separate inputs** — your **screen**, your **microphone**, and your **meeting audio** (what the other person says) — and uses an AI model to help you in real time.

| Feature | How to trigger | What it uses |
|---|---|---|
| **Assist** | `⌘`/`Ctrl` + `↵` or the *Assist* button | your screen + recent conversation |
| **What should I say?** | button | meeting audio + your mic |
| **Follow-up questions** | button | the whole conversation |
| **Recap** | button | the whole conversation |
| **Ask anything** | type + `↵` | your screen + conversation |
| **Solve a coding problem** | `⌘`/`Ctrl` + `H` | your screen only |
| **Smart** toggle | pill in the box | switches to a smarter (slower) model |

It's a copilot for **live meetings** ("what do I say to that?") and **coding problems** (screenshot → full solution), and it's designed to be **invisible in screen shares** so it stays your private assistant.

---

## Install

There are two ways to install OpenCluely. **If you're not a developer, use Option A.**

### Option A — Download the app (easiest)

**Platforms:** macOS and Windows

1. Go to the [**Releases**](../../releases) page and download the appropriate file for your platform:
   - **macOS:** `OpenCluely-mac.zip`
   - **Windows:** `OpenCluely-win.zip`

2. **macOS:** Double-click the zip to unzip it. You'll get **`OpenCluely.app`**. Drag **`OpenCluely.app`** into your **Applications** folder.

3. **Windows:** Double-click the zip to extract it. Run **`OpenCluely Setup.exe`** to install.

4. **macOS only:** First open (important): because OpenCluely is a free app without a paid Apple certificate, macOS will refuse to open it normally the first time. Do this once:
   - **Right-click** `OpenCluely.app` → **Open** → click **Open** in the dialog.
   - If macOS instead says **"OpenCluely is damaged and can't be opened,"** open the **Terminal** app and paste this line, then press Return:
     ```bash
     xattr -cr /Applications/OpenCluely.app
     ```
     Then double-click OpenCluely.app again. (This just tells macOS "yes, I trust this app I downloaded." It's safe.)

After that, OpenCluely opens normally forever.

### Option B — Run from source (developers)

You need [Node.js](https://nodejs.org) 18+ installed. No Xcode required.

```bash
git clone https://github.com/rahulcvwebsitehosting/OpenCluely.git
cd OpenCluely
npm install
npm start
```

To build your own app:

**macOS:**
```bash
npm run pack      # creates dist/mac-arm64/OpenCluely.app
```
> Note: the packaged app is **ad-hoc signed** (no paid Apple certificate). macOS ties permission grants to the exact build, so **rebuilding resets the mic/screen permissions** — you'll grant them again. For everyday use, build once and keep it.

**Windows:**
```bash
npm run pack      # creates dist/win-unpacked/
```
> The Windows build creates an unpacked directory. To create an installer:
> ```bash
> npm run dist     # creates dist/OpenCluely Setup.exe
> ```

---

## First launch — the 1-minute setup

When OpenCluely opens the first time, a **built-in tutorial** walks you through everything below. You can reopen it anytime by clicking the **OpenCluely logo** (top-left of the pill). Here's the same thing in writing.

### Step 1 — Grant permissions

OpenCluely can't help until the system lets it see and hear. When you first use a feature, the system will prompt you — click **Allow**. If a prompt doesn't appear, add OpenCluely manually:

- **macOS:**
  - **Microphone:** System Settings → **Privacy & Security** → **Microphone** → turn on **OpenCluely**.
  - **Screen Recording:** System Settings → **Privacy & Security** → **Screen Recording** → turn on **OpenCluely**. (This one grant covers both screenshots *and* meeting audio.) macOS may ask you to **quit & reopen** OpenCluely — let it.

- **Windows:**
  - **Microphone:** Settings → **Privacy & security** → **Microphone** → turn on **Allow apps to access your microphone** and ensure **OpenCluely** is allowed.
  - **Screen Recording:** Settings → **Privacy & security** → **Background apps** → ensure **OpenCluely** can run in the background, and grant **Screen capture** permissions when prompted.

### Step 2 — Add your AI key (bring your own)

OpenCluely uses **your own** API key, so it's free to run (you only pay your AI provider for what you use). Click the **`...`** button in the input box (or press `⌘` `,`) to open **Settings**, pick a provider, and paste your key:

| Provider | Get a key | Notes |
|---|---|---|
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | One key does everything — **but** for the *listening* features the key must have **Whisper / audio** access (a "restricted" project key that only allows chat will give a 403 on transcription). |
| **Anthropic (Claude)** | [console.anthropic.com](https://console.anthropic.com) | Great for screen & coding help. Claude has no speech-to-text, so add an OpenAI or Gemini key too if you want the listening features. |
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | One key does chat + transcription. |
| **Mistral** | [console.mistral.ai](https://console.mistral.ai) | European AI provider with strong models. |
| **NVIDIA** | [build.nvidia.com](https://build.nvidia.com) | Access NVIDIA's AI models through their API. |
| **Ollama** | [ollama.ai](https://ollama.ai) | Run LLMs locally (no API key needed). Start Ollama server first. |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) | Unified API for multiple AI providers. |

Your key is stored **only on your computer** (in `opencluely-data.json`) and is sent **only** to that provider. OpenCluely has no server and collects nothing.

### Step 3 — The Zoom setting (only needed for Zoom)

OpenCluely is hidden from most screen-share tools automatically — **Google Meet, Microsoft Teams, and QuickTime need nothing.** **Zoom** has a specific setting that decides whether it respects OpenCluely's "don't capture me" flag:

> **Zoom → Settings → Share Screen → Advanced → Screen capture mode → choose "Advanced capture with window filtering."**

<div align="center"><img src="docs/zoom-setting.png" width="560" alt="Zoom screen capture mode setting" /></div>

**Why:** the *"...with window filtering"* modes tell Zoom to leave out windows that mark themselves as private — which is exactly what OpenCluely does. The **"Advanced capture without window filtering"** mode grabs the raw screen and **will show OpenCluely**, so avoid it.

---

## How to use it

- **Assist:** `⌘`/`Ctrl` + `↵` — The do-the-smart-thing key. On a coding problem it solves it; in a conversation it tells you what to say. Works from anywhere.
- **Solve coding problem:** `⌘`/`Ctrl` + `H` — Screenshots a coding problem and returns the approach, code, and time/space complexity.
- **The `▢` button** (top bar) — start/stop **listening** to a meeting. The green dot means it's live.
- **Type a question** in the box and press `↵` to ask about your screen or conversation.
- **Smart** — flip it on for a smarter, more thorough model; off for fast and cheap.
- **Hide** collapses the panel to just the top bar. Drag OpenCluely around by the **top pill**. Quit with `⌘`/`Ctrl` + `⇧` + `X`.

The panel is see-through and click-through — the empty space around it never blocks the app behind it.

---

## How it works (under the hood)

OpenCluely is an [Electron](https://www.electronjs.org/) app. Everything runs locally except the calls to your chosen AI provider.

**The three inputs are kept completely separate:**
- **Screen** — captured with Electron's `desktopCapturer` (full-resolution screenshots, taken only when a feature needs one).
- **Your mic ("You")** — `getUserMedia` → downsampled to 16 kHz audio → transcribed.
- **Meeting audio ("Them")** — `getDisplayMedia` loopback capture of your system's output audio, kept on its own channel so OpenCluely knows *who* said what.

Both audio streams are transcribed (OpenAI Whisper or Gemini) and fed, with an optional screenshot, to your AI model. Responses **stream** into the panel word-by-word.

**The invisibility** is platform-specific:

- **macOS:** Uses `setContentProtection(true)` which sets `NSWindowSharingNone`. This asks the window server to exclude OpenCluely from screen-capture streams. It's the same mechanism DRM apps and Zoom's own toolbar use. Note: on macOS 15.4+ Apple lets some capture tools ignore it, which is why it's best-effort (see the disclaimer at the top).

- **Windows:** Uses standard Electron window management. OpenCluely stays on top of other windows but may appear in screen recordings. For best results in meetings, use OpenCluely's click-through feature and position it carefully.

On both platforms, the window is frameless, transparent, and click-through in empty areas to minimize interference with your work.

```
main process ──┬─ overlay window (frameless, transparent, always-on-top, content-protected)
               ├─ screenshot capture (desktopCapturer)
               ├─ speech-to-text (Whisper / Gemini)      ── "You" + "Them" channels
               └─ LLM streaming (OpenAI / Anthropic / Gemini)
renderer ──────┴─ the glass UI + mic capture + system-audio loopback
```

---

## Troubleshooting

**"It says give access, but I already gave access."**
You probably granted an older build. Because the app identity changes on rebuild, the system may stop honoring old permissions. Toggle OpenCluely **off and on** in system privacy settings, or remove and re-add it.

**OpenCluely appears in my screen recording on Windows**
On Windows, OpenCluely uses standard window management. For best results:
- Use the click-through feature (hover over the panel to enable mouse interaction, empty areas pass through)
- Position OpenCluely in a corner where it won't obscure important content
- Consider using Windows' "Always on top" feature to keep your work window visible

**A feature returns "403" / "no access to model."**
Your API key is restricted. Most often it's an OpenAI **project key that only allows chat models** — it works for screen/coding help but 403s on transcription (Whisper). Fix: enable audio/Whisper on the key, use an unrestricted key, or add a Gemini key (OpenCluely falls back to it for transcription).

**Listening does nothing / no transcript.**
Check Settings shows a transcription-capable key (OpenAI with Whisper, or Gemini). Also make sure Screen Recording is granted (meeting audio needs it).

**OpenCluely shows up in my Zoom share.**
Set Zoom's **Screen capture mode** to *"Advanced capture with window filtering"* (see Step 3). And remember: on macOS 15.4+ this can still fail — it's best-effort.

**"OpenCluely is damaged and can't be opened."**
Run `xattr -cr /Applications/OpenCluely.app` in Terminal once (see Install → Option A).

---

## Privacy

- No accounts, no servers, no telemetry. OpenCluely collects nothing.
- Your API keys live in a local file (`opencluely-data.json`) and are sent only to the provider you chose.
- Screenshots and audio are sent to your AI provider only when a feature runs, and are not stored by OpenCluely beyond the current session's transcript (kept in memory).

## Contributing

Issues and PRs welcome. OpenCluely is intentionally small and readable — `main.js` (app + capture + AI), `renderer/` (the UI), `src/` (providers). No build step for the source (plain HTML/CSS/JS).

## Credits & license

Built as an open-source alternative to Cluely. Modeled on open-source projects and designed for privacy and flexibility.

**License: [GPL-3.0-or-later](LICENSE).**

## Creator

| Platform        | URL                                        |
| --------------- | ------------------------------------------ |
| **Portfolio**   | <https://rahulshyam-portfolio.vercel.app/> |
| **LinkedIn**    | <https://linkedin.com/in/rahulshyamcivil>  |
| **X (Twitter)** | <https://x.com/RahulShyamCV>               |
| **Threads**     | <https://threads.com/@rahulcvjps>          |
| **GitHub**      | <https://github.com/rahulcvwebsitehosting> |

**Platforms:** macOS and Windows
