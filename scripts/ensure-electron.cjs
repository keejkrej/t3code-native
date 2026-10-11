const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

try {
  const electronPath = require('electron');
  if (fs.existsSync(electronPath)) {
    process.exit(0);
  }
} catch (err) {
  // Needs extraction
}

try {
  console.log('[ensure-electron] Setting up Electron binary...');
  const electronPkgPath = path.dirname(require.resolve('electron/package.json'));
  const distPath = path.join(electronPkgPath, 'dist');
  const pathTxtPath = path.join(electronPkgPath, 'path.txt');

  const home = os.homedir();
  const cacheDirs = [
    process.env.electron_config_cache,
    process.env.XDG_CACHE_HOME ? path.join(process.env.XDG_CACHE_HOME, 'electron') : null,
    path.join(home, '.cache', 'electron'),
    path.join(home, 'Library', 'Caches', 'electron'),
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'electron', 'Cache') : null,
  ].filter(Boolean);

  let zipFile = null;

  const findZip = (dir) => {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findZip(full);
        if (found) return found;
      } else if (entry.name.endsWith('.zip')) {
        return full;
      }
    }
    return null;
  };

  for (const dir of cacheDirs) {
    zipFile = findZip(dir);
    if (zipFile) break;
  }

  if (zipFile && fs.existsSync(zipFile)) {
    console.log(`[ensure-electron] Extracting ${zipFile} to ${distPath}...`);
    fs.mkdirSync(distPath, { recursive: true });
    execSync(`unzip -qo "${zipFile}" -d "${distPath}"`);
    fs.writeFileSync(pathTxtPath, 'electron');
    const binPath = path.join(distPath, 'electron');
    if (fs.existsSync(binPath)) {
      fs.chmodSync(binPath, 0o755);
    }
    const sandboxPath = path.join(distPath, 'chrome-sandbox');
    if (fs.existsSync(sandboxPath)) {
      fs.chmodSync(sandboxPath, 0o755);
    }
    console.log('[ensure-electron] Electron binary successfully configured.');
  }
} catch (e) {
  console.error('[ensure-electron] Failed to ensure electron:', e.message);
}
