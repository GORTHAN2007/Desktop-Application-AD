# Frontend Client

React application powered by Vite, running inside the Electron container (or standalone in browser during development).

## Features

- **Permissions & Hardware Checks**: Webcam stream preview and fullscreen kiosk triggers.
- **Dynamic Exam Engine**: Real-time timer countdown synced with Electron main process, MCQ navigation, and answer submission.
- **Background Proctoring Loop**: Captures webcam pictures via `ImageCapture` and requests desktop screenshots every 5 seconds.
- **Claude-Inspired Styling**: Clean layout, dotted background pattern, and typography with Google Fonts (*Newsreader* & *Plus Jakarta Sans*).

## Development

```bash
# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev

# Run linting
npm run lint

# Build production bundle for Electron fallback
npm run build
```
