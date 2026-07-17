# Windows Support Implementation

This document describes the changes made to add Windows support to the cue application.

## Summary

The cue application has been modified to support both macOS and Windows platforms. The app now works on:
- **macOS** (existing support maintained)
- **Windows** (new support added)

## Changes Made

### 1. main.js (Electron Main Process)

**Platform-specific window handling:**
- Added platform detection using `process.platform`
- Wrapped macOS-specific `setContentProtection()` in a platform check (line 50-52)
- Added conditional for macOS dock hiding (line 196)
- Made global shortcuts platform-agnostic (lines 188-190)

**Changes:**
```javascript
// Before: Always called macOS-specific functions
win.setContentProtection(!process.env.CUE_NO_PROTECT);
if (app.dock) app.dock.hide();
globalShortcut.register('CommandOrControl+Return', ...);

// After: Platform-aware code
hasContentProtection = process.platform === 'darwin';
if (process.platform === 'darwin' && app.dock) app.dock.hide();
globalShortcut.register(process.platform === 'darwin' ? 'CommandOrControl+Return' : 'Control+Enter', ...);
```

### 2. package.json (Build Configuration)

**Added Windows build target:**
- Added `win` configuration to electron-builder (lines 38-44)
- Updated `dist` script to build for both macOS and Windows (line 11)
- Added "windows" to keywords list (line 53)

**Changes:**
```json
"scripts": {
  "dist": "electron-builder --mac zip --win"
},
"build": {
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  }
},
"keywords": ["electron", "overlay", "ai", "assistant", "screencapturekit", "macos", "windows"]
```

### 3. README.md (Documentation)

**Updated installation instructions:**
- Added Windows download option (lines 48-59)
- Updated build instructions for Windows (lines 72-76)
- Added platform-specific permission instructions (lines 88-103)
- Updated keyboard shortcuts to show both macOS and Windows versions (lines 30, 35, 117-122)
- Updated onboarding tutorial to be platform-agnostic
- Added Windows-specific troubleshooting section (lines 185-189)
- Updated "How it works" section to explain platform differences (lines 130-150)
- Added "Platforms: macOS and Windows" to footer (line 219)

### 4. renderer/renderer.js (Frontend UI)

**Platform-agnostic onboarding:**
- Updated OB_STEPS array to use platform detection via `window.cue.platform` (lines 313-343)
- Added conditional logic to show appropriate permission URLs for each platform
- Updated keyboard shortcuts in tutorial to show both macOS and Windows versions (lines 340-343)

### 5. preload.js (IPC Bridge)

**Added platform exposure:**
- Exposed `process.platform` through contextBridge as `window.cue.platform` (line 3)
- This allows renderer to access platform information without Node.js integration

**Changes:**
```javascript
// Platform-specific permission URLs
if (process.platform === 'win32') {
  action: () => cue.openPane('ms-settings:privacy-microphone')
} else {
  action: () => cue.openPane('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone')
}
```

## Platform Differences

### macOS
- Uses `setContentProtection(true)` to hide from screen capture
- Hides app from dock using `app.dock.hide()`
- Uses macOS-specific system preference URLs
- Uses Command key for shortcuts (⌘)

### Windows
- Uses standard Electron window management
- May appear in screen recordings (standard window behavior)
- Uses Windows-specific system preference URLs (ms-settings:)
- Uses Control key for shortcuts (Ctrl)

## Testing

To test Windows support:

1. **Run from source:**
   ```bash
   git clone https://github.com/Blueturboguy07/cue.git
   cd cue
   npm install
   npm start
   ```

2. **Build for Windows:**
   ```bash
   npm run pack      # creates dist/win-unpacked/
   npm run dist      # creates dist/cue Setup.exe
   ```

## Known Limitations

### Windows
- cue uses standard window management and may appear in screen recordings
- For best results, use the click-through feature and position cue carefully
- Windows does not have the same content protection mechanism as macOS

### Both Platforms
- Screen capture permissions are required for screen-sharing apps
- API keys must be provided by the user (OpenAI, Anthropic, or Gemini)
- The app is designed to be invisible but this is best-effort on all platforms

## Future Improvements

Potential enhancements for better Windows support:
1. Add system tray integration for Windows
2. Implement Windows-specific content protection mechanisms
3. Add Windows-specific installer branding
4. Create platform-specific documentation screenshots

## Compatibility

- **Electron:** 33.2.1 (cross-platform)
- **Node.js:** 18+ (required for building)
- **Platforms:** macOS 10.15+, Windows 10+
