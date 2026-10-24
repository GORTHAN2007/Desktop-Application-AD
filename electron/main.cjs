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
