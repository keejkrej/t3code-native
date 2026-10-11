import { contextBridge, ipcRenderer } from 'electron';

export interface DesktopBridge {
  platform: string;
  arch: string;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
  openExternal: (url: string) => Promise<void>;
  selectDirectory: () => Promise<string | null>;
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
}

const desktopBridge: DesktopBridge = {
  platform: process.platform,
  arch: process.arch,
  minimizeWindow: () => {
    ipcRenderer.send('window-minimize');
  },
  maximizeWindow: () => {
    ipcRenderer.send('window-maximize');
  },
  closeWindow: () => {
    ipcRenderer.send('window-close');
  },
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_: any, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window-maximize-changed', handler);
    return () => {
      ipcRenderer.removeListener('window-maximize-changed', handler);
    };
  },
};

contextBridge.exposeInMainWorld('t3Desktop', desktopBridge);
