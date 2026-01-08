// preload.js
// Exposes safe APIs to renderer

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add APIs as needed, e.g. for file dialogs
  // openFile: () => ipcRenderer.invoke('dialog:openFile'),
});
