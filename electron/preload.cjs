const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setFullScreen: () => ipcRenderer.invoke("full-screen"),
  showRulesDialog: () => ipcRenderer.invoke("show-rules-dialog"),
  startTest: () => ipcRenderer.invoke("start-test"),
  getRemainingTime: () => ipcRenderer.invoke("get-time"),
});
