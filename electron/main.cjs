const { BrowserWindow, app, ipcMain, dialog, desktopCapturer, screen } = require("electron");
const path = require("path");
const fs = require("fs");

let win = null;
let isExamActive = false;
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:5173/").catch(() => {
    win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
    // Window Blur Violation (detect tab or app switching during test)
  win.on("blur", () => {
    if (isExamActive && win && !win.isDestroyed()) {
      win.webContents.send("violation:blur", {
        timestamp: Date.now(),
        message: "Window focus lost. App or tab switching detected.",
      });
    }
  });

  // Intercept keyboard shortcuts
  win.webContents.on("before-input-event", (event, input) => {
    const isCmdOrCtrl = input.control || input.meta;
    const key = input.key ? input.key.toLowerCase() : "";

    // Block DevTools shortcuts (F12, Ctrl+Shift+I, Cmd+Option+I)
    if (
      (isCmdOrCtrl && input.shift && key === "i") ||
      (input.meta && input.alt && key === "i") ||
      input.key === "F12"
    ) {
      if (!isDev || isExamActive) {
        event.preventDefault();
        console.log("DevTools shortcut blocked");
        return;
      }
    }

    // Block Save (Ctrl+S / Cmd+S)
    if (isCmdOrCtrl && key === "s") {
      event.preventDefault();
      return;
    }

    // Block Reload during test (F5, Ctrl+R, Cmd+R)
    if (isExamActive && (key === "f5" || (isCmdOrCtrl && key === "r"))) {
      event.preventDefault();
      return;
    }

    // Block Copy (Cmd+C / Ctrl+C) and show alert dialog
    if (input.type === "keyDown" && isCmdOrCtrl && key === "c") {
      event.preventDefault();
      dialog.showMessageBox(win, {
        type: "warning",
        title: "Action Not Allowed",
        message: "Copying text is strictly prohibited during the exam.",
        buttons: ["OK"],
      });
      return;
    }

    // Block Cut / Paste / Select All during test
    if (isExamActive && isCmdOrCtrl && ["v", "x", "a"].includes(key)) {
      event.preventDefault();
    }
  });


  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
