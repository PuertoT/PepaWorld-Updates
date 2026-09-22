'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('pepa',Object.freeze({state:()=>ipcRenderer.invoke('state'),check:()=>ipcRenderer.invoke('check'),update:()=>ipcRenderer.invoke('update'),updateLauncher:()=>ipcRenderer.invoke('update-launcher'),play:()=>ipcRenderer.invoke('play'),choose:kind=>ipcRenderer.invoke('choose',kind),saveSettings:s=>ipcRenderer.invoke('settings',s),folder:()=>ipcRenderer.invoke('folder'),onProgress:callback=>{ipcRenderer.on('progress',(_e,m)=>callback(m));}}));
