const { BrowserWindow, app, ipcMain } = require("electron");
const path = require("path");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:5173/").catch(() => {
    win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  });

  win.on("closed", () => {
    win = null;
  });
}

ipcMain.handle("full-screen", () => {
  if (win) {
    win.kiosk = true;
    win.setFullScreen(true);
    return true;
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
