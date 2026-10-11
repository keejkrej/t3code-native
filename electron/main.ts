import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { spawn, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let isServerHealthy = false;

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
}

function findServerBinary(): string | null {
  const candidates = [
    path.join(__dirname, '../server/bin/t3server'),
    path.join(__dirname, '../../server/bin/t3server'),
    path.join(app.getAppPath(), 'server/bin/t3server'),
    path.join(process.resourcesPath, 'server/bin/t3server'),
    path.join(process.resourcesPath, 'bin/t3server'),
    '/home/jack/.local/share/t3code-native/server/bin/t3server',
    '/home/jack/workspace/t3code-native/server/bin/t3server',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function checkServerHealth(port = 3773): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startBundledServer(): Promise<void> {
  const alreadyRunning = await checkServerHealth(3773);
  if (alreadyRunning) {
    console.log('[Main] T3 Code server already running on port 3773');
    isServerHealthy = true;
    return;
  }

  const serverBin = findServerBinary();
  if (!serverBin) {
    console.warn('[Main] Warning: Could not find t3server binary');
    return;
  }

  console.log(`[Main] Spawning bundled server: ${serverBin}`);
  try {
    const workingDir = process.env.T3_WORKSPACE_ROOT || process.cwd();
    serverProcess = spawn(serverBin, ['--port=3773', `--cwd=${workingDir}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    serverProcess.stdout?.on('data', (chunk) => {
      console.log(`[t3server] ${chunk.toString().trim()}`);
    });

    serverProcess.stderr?.on('data', (chunk) => {
      console.error(`[t3server ERR] ${chunk.toString().trim()}`);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(`[t3server] Process exited with code ${code}, signal ${signal}`);
      serverProcess = null;
      isServerHealthy = false;
    });

    // Wait for the server to report healthy
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (await checkServerHealth(3773)) {
        console.log('[Main] Bundled server is up and listening on port 3773!');
        isServerHealthy = true;
        break;
      }
    }
  } catch (err) {
    console.error('[Main] Failed to spawn t3server:', err);
  }
}

function stopBundledServer(): void {
  if (serverProcess && !serverProcess.killed) {
    console.log('[Main] Terminating bundled server...');
    serverProcess.kill('SIGTERM');
    const proc = serverProcess;
    setTimeout(() => {
      if (proc && !proc.killed) {
        try {
          proc.kill('SIGKILL');
        } catch {}
      }
    }, 2000);
    serverProcess = null;
    isServerHealthy = false;
  }
}

function createWindow() {
  const iconPath = '/home/jack/.local/share/icons/t3code-native.png';

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'T3 Code (Native)',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximize-changed', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximize-changed', false);
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch(() => {
      mainWindow?.loadURL('http://localhost:5173');
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('get-server-status', () => {
  return {
    bundled: !!findServerBinary(),
    healthy: isServerHealthy,
    port: 3773,
  };
});

ipcMain.handle('open-external', async (_, url: string) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
  }
});

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

app.whenReady().then(async () => {
  await startBundledServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  stopBundledServer();
});

app.on('will-quit', () => {
  stopBundledServer();
});

app.on('window-all-closed', () => {
  stopBundledServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
