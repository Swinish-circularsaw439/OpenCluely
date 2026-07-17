# Windows support

OpenCluely runs on Windows 10 and 11.

## Shortcuts

| Action | Shortcut |
|---|---|
| Assist | `Ctrl` + `Enter` |
| Solve coding problem | `Ctrl` + `H` |
| Open Settings | `Ctrl` + `,` |
| Quit | `Ctrl` + `Shift` + `X` |

## Screen sharing

On Windows, OpenCluely uses standard Electron window management. It stays on top of other windows but may appear in screen recordings. Position it in a corner where it won't obscure important content.

## Permissions

- **Microphone:** Settings → Privacy & security → Microphone → allow OpenCluely
- **Screen capture:** grant when prompted on first screenshot

## Building from source

```bash
npm install
npm start
```

To create a portable build:
```bash
npx @electron/packager . OpenCluely --platform=win32 --arch=x64 --out=dist
```
