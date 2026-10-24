const { BrowserWindow, app, ipcMain, dialog, desktopCapturer, screen } = require("electron");
const path = require("path");
const fs = require("fs");

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

  // Anti-Cheat Shortcuts Interception
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;

    const key = input.key.toLowerCase();
    const isCtrlOrCmd = input.control || input.meta;

    // Block DevTools: F12, Ctrl/Cmd + Shift + I, Cmd + Alt + I
    if (
      input.key === "F12" ||
      (isCtrlOrCmd && input.shift && key === "i") ||
      (input.meta && input.alt && key === "i")
    ) {
      event.preventDefault();
      return;
    }

    // Block Save: Ctrl/Cmd + S
    if (isCtrlOrCmd && key === "s") {
      event.preventDefault();
      return;
    }

    // Block Copy: Ctrl/Cmd + C and show warning
    if (isCtrlOrCmd && key === "c") {
      event.preventDefault();
      dialog.showMessageBox(win, {
        type: "warning",
        title: "Warning",
        message: "Copy is not allowed",
        buttons: ["OK"],
      });
      return;
    }

    // Block Cut (x), Paste (v), Select All (a): Ctrl/Cmd + [x, v, a]
    if (isCtrlOrCmd && (key === "x" || key === "v" || key === "a")) {
      event.preventDefault();
      return;
    }
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

// Save webcam photo
ipcMain.handle("save-photo", async (_event, arrayBuffer) => {
  try {
    const dir = path.join(app.getAppPath(), "cameraFeed");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const timestamp = Date.now();
    const filePath = path.join(dir, `${timestamp}.jpeg`);
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);
    return { success: true, filePath };
  } catch (err) {
    console.error("Error saving photo:", err);
    return { success: false, error: err.message };
  }
});

// Capture desktop screenshot
ipcMain.handle("capture-screen", async () => {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width, height },
    });

    if (!sources || sources.length === 0) {
      throw new Error("No screen sources found");
    }

    const primarySource = sources[0];
    const image = primarySource.thumbnail;
    const jpegBuffer = image.toJPEG(80);

    const dir = path.join(app.getAppPath(), "screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = Date.now();
    const filePath = path.join(dir, `screen_${timestamp}.jpeg`);
    await fs.promises.writeFile(filePath, jpegBuffer);
    return { success: true, filePath };
  } catch (err) {
    console.error("Error capturing screen:", err);
    return { success: false, error: err.message };
  }
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
