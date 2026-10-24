const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");

let win = null;
let end_time = null;

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

ipcMain.handle("show-rules-dialog", async () => {
  if (!win) return false;
  const result = await dialog.showMessageBox(win, {
    type: "info",
    title: "Exam Rules & Instructions",
    message: "Exam Rules & Guidelines",
    detail:
      "1. Make sure your webcam remains on throughout the test.\n" +
      "2. Stay in full-screen mode. Do not switch tabs or minimize the window.\n" +
      "3. Do not leave your seat or look away from the screen for prolonged periods.\n" +
      "4. No external help, electronic devices, or secondary monitors are permitted.\n" +
      "5. Ensure a quiet, well-lit environment without background voices.",
    buttons: ["I Agree & Start Test", "Cancel"],
    defaultId: 0,
    cancelId: 1,
  });
  return result.response === 0;
});

ipcMain.handle("start-test", () => {
  end_time = Date.now() + 60 * 60 * 1000; // 60 minutes in ms
  return end_time;
});

ipcMain.handle("get-time", () => {
  if (!end_time) return 0;
  return Math.max(0, end_time - Date.now());
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
