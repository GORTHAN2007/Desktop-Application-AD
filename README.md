# Secure Online Examination & Proctoring Desktop Application

A modern, secure, cross-platform desktop examination portal built with **Electron**, **React (Vite)**, and an **Express.js** backend. The system features hardware access permission checks, fullscreen kiosk enforcement, background automated proctoring (webcam & screen captures), anti-cheat keyboard shortcuts blocking, live timer countdown, and instant exam evaluation.

---

## 🌟 Key Features

- **Hardware & Environment Verification**:
  - Permissions screen validating live camera feed and fullscreen mode before exam start.
  - Floating live webcam preview in the top corner throughout the test.
- **Kiosk Mode & Exam Rules Enforcement**:
  - Borderless frameless Electron window with kiosk lock.
  - Native confirmation dialog detailing exam rules and regulations before starting.
- **Automated AI/Proctoring Loop**:
  - Periodic background webcam snapshots saved to `cameraFeed/`.
  - Periodic full desktop screenshots saved to `screenshots/` using Electron `desktopCapturer`.
- **Anti-Cheat Shortcut Suppression**:
  - Intercepts and suppresses keyboard shortcuts in the main process:
    - DevTools (`F12`, `Ctrl/Cmd + Shift + I`, `Cmd + Alt + I`)
    - Save (`Ctrl/Cmd + S`)
    - Copy (`Ctrl/Cmd + C`) with warning dialog alert
    - Cut (`Ctrl/Cmd + X`), Paste (`Ctrl/Cmd + V`), Select All (`Ctrl/Cmd + A`)
- **Exam Engine & Evaluation**:
  - Synchronized exam countdown timer managed securely in the Electron main process (tamper-resistant).
  - Dynamic MCQ delivery, instant answer tracking, and server-side scoring with question evaluation, accuracy percentage, and summary breakdown.
- **Claude-Inspired UI**:
  - Clean dotted-grid background, typography pairing using Google Fonts (**Newsreader** serif for titles and **Plus Jakarta Sans** for clean UI), and responsive card containers.

---

## 🏗️ Architecture

```
Desktop Application/
├── backend/                # Express REST API & session store
│   ├── data/
│   │   ├── questions.json  # Question bank (MCQs & answers)
│   │   └── session.json    # Candidate exam sessions & responses
│   └── server.js           # Server running on port 5002
├── electron/               # Electron Main & Preload scripts
│   ├── main.cjs            # Window creation, IPC handlers, proctoring & shortcuts
│   └── preload.cjs         # Context bridge exposing safe IPC APIs to React
├── frontend/               # Vite + React Client
│   ├── src/
│   │   ├── App.jsx         # Permissions, Exam & Results state and views
│   │   ├── App.css         # Application component styling
│   │   ├── index.css       # Claude-inspired dotted background & typography
│   │   └── main.jsx        # React root
│   ├── index.html          # HTML shell with Google Fonts
│   └── vite.config.js      # Vite dev server & build configuration
├── cameraFeed/             # Stored webcam snapshot captures
├── screenshots/            # Stored full-desktop screenshot captures
└── package.json            # Root configuration & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GORTHAN2007/Desktop-Application-AD.git
   cd Desktop-Application-AD
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## 💻 Running the Application

For full operation, run the **Backend Server**, **Frontend Dev Server**, and **Electron App**:

### Terminal 1: Start Backend Server
```bash
cd backend
node server.js
```
*Backend runs on `http://localhost:5002`.*

### Terminal 2: Start Frontend Dev Server
```bash
npm run dev:frontend
```
*Vite runs on `http://localhost:5173`.*

### Terminal 3: Launch Electron Desktop Application
```bash
npm start
```
*Launches the secure Electron desktop window.*

---

## ⚙️ Backend API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/exam/start` | Initiates candidate session and sets exam duration |
| `GET` | `/exam/mcq` | Fetches randomized MCQ question list |
| `POST` | `/exam/answer` | Records candidate response for a question |
| `POST` | `/exam/submit` | Finalizes exam, tallies scores, and returns results |

---

## 🔒 Security & Anti-Cheat Mechanisms

1. **Process Isolation (`contextIsolation: true`)**: Node integration is disabled in the renderer; all hardware interactions go strictly through secure `contextBridge` IPC channels.
2. **Server-Side Scoring**: Correct answer keys are stored exclusively in `backend/data/questions.json` and evaluated on the server to prevent client inspection.
3. **Hardware Lock-in**: Fullscreen kiosk mode prevents window minimization or switching tabs during testing.
4. **Input Interception**: Low-level `before-input-event` listener prevents DevTools access, copy-pasting, and saving page source.

---
