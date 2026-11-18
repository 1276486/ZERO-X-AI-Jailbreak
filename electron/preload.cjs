"use strict";
const { contextBridge, ipcRenderer } = require("electron");

// 渲染进程唯一的对外通道；不开 nodeIntegration。
contextBridge.exposeInMainWorld("hs", {
  state: () => ipcRenderer.invoke("tool:state"),
  memory: () => ipcRenderer.invoke("tool:memory"),
  readMemory: () => ipcRenderer.invoke("tool:memory:read"),
  writeMemory: (name, text) => ipcRenderer.invoke("tool:memory:write", { name, text }),
  skillsList: () => ipcRenderer.invoke("tool:skills:list"),
  skillsRead: (id) => ipcRenderer.invoke("tool:skills:read", id),
  skillsWrite: (id, text) => ipcRenderer.invoke("tool:skills:write", { id, text }),
  skillsCreate: (name, description) => ipcRenderer.invoke("tool:skills:create", { name, description }),
  skillsDelete: (id) => ipcRenderer.invoke("tool:skills:delete", id),
  mcpList: () => ipcRenderer.invoke("tool:mcp:list"),
  mcpSave: (server) => ipcRenderer.invoke("tool:mcp:save", server),
  mcpRemove: (id) => ipcRenderer.invoke("tool:mcp:remove", id),
  mcpApply: (targetId) => ipcRenderer.invoke("tool:mcp:apply", targetId),
  install: (targetId, mode) => ipcRenderer.invoke("tool:install", targetId, mode),
  uninstall: (targetId) => ipcRenderer.invoke("tool:uninstall", targetId),
  // 装回原始记忆：还原安装前的记忆档案，保留技能库（仅 WorkBuddy）
  restoreMemory: (targetId) => ipcRenderer.invoke("tool:restoreMemory", targetId),
  restartCodex: () => ipcRenderer.invoke("tool:restartCodex"),
  openQQ: (url) => ipcRenderer.invoke("tool:openQQ", url),
  copy: (text) => ipcRenderer.invoke("tool:copy", text),
  quit: () => ipcRenderer.invoke("tool:quit"),
  win: (action) => ipcRenderer.invoke("tool:win", action),

  onLog: (cb) => {
    const h = (_e, payload) => cb(payload);
    ipcRenderer.on("tool:log", h);
    return () => ipcRenderer.removeListener("tool:log", h);
  },
  onStatus: (cb) => {
    const h = (_e, payload) => cb(payload);
    ipcRenderer.on("tool:status", h);
    return () => ipcRenderer.removeListener("tool:status", h);
  },
  onNotify: (cb) => {
    const h = (_e, payload) => cb(payload);
    ipcRenderer.on("tool:notify", h);
    return () => ipcRenderer.removeListener("tool:notify", h);
  },
});
