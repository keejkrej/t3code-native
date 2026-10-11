#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME = process.env.HOME || '/home/jack';
const REPO_ROOT = path.resolve(__dirname, '..');
const INSTALL_DIR = path.join(HOME, '.local/share/t3code-native');
const BIN_DIR = path.join(HOME, '.local/bin');
const APPS_DIR = path.join(HOME, '.local/share/applications');
const ICONS_DIR = path.join(HOME, '.local/share/icons');

console.log('==> Installing T3 Code Native to Arch Linux...');

// 1. Ensure target directories
[
  INSTALL_DIR,
  path.join(INSTALL_DIR, 'bin'),
  path.join(INSTALL_DIR, 'bundle'),
  path.join(INSTALL_DIR, 'bundle/assets/fonts'),
  path.join(INSTALL_DIR, 'server/bin'),
  BIN_DIR,
  APPS_DIR,
  ICONS_DIR,
].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// 2. Copy native engine and Hermes bundle
console.log('--> Copying React Native Linux engine & bundles...');
const rnlBinSrc = '/home/jack/workspace/react-native-linux/build/release/bin/rnl_window';
const hermescSrc = '/home/jack/workspace/react-native-linux/build/release/bin/hermesc';
if (fs.existsSync(rnlBinSrc)) {
  execSync(`cp --remove-destination "${rnlBinSrc}" "${path.join(INSTALL_DIR, 'bin/rnl_window')}"`);
  fs.chmodSync(path.join(INSTALL_DIR, 'bin/rnl_window'), 0o755);
}
if (fs.existsSync(hermescSrc)) {
  execSync(`cp --remove-destination "${hermescSrc}" "${path.join(INSTALL_DIR, 'bin/hermesc')}"`);
  fs.chmodSync(path.join(INSTALL_DIR, 'bin/hermesc'), 0o755);
}

execSync(`cp -r "${path.join(REPO_ROOT, 'dist')}/*" "${INSTALL_DIR}/bundle/" 2>/dev/null || true`);

// 3. Copy bundled Go server binary
console.log('--> Bundling t3server Go binary...');
const serverBinSrc = path.join(REPO_ROOT, 'server/bin/t3server');
if (!fs.existsSync(serverBinSrc)) {
  console.log('--> Building server binary first...');
  execSync('go build -o bin/t3server ./cmd/t3server', { cwd: path.join(REPO_ROOT, 'server'), stdio: 'inherit' });
}
execSync(`cp --remove-destination "${serverBinSrc}" "${path.join(INSTALL_DIR, 'server/bin/t3server')}"`);
fs.chmodSync(path.join(INSTALL_DIR, 'server/bin/t3server'), 0o755);

// 4. Install launcher script in ~/.local/bin/t3code-native
console.log('--> Installing CLI launcher in ~/.local/bin/t3code-native...');
const launcherScript = `#!/usr/bin/env bash
# T3 Code Native (Linux / Wayland / Vulkan / Skia / React Native) launcher

APP_DIR="\${XDG_DATA_HOME:-\$HOME/.local/share}/t3code-native"
SERVER_BIN="\$APP_DIR/server/bin/t3server"
WINDOW_BIN="\$APP_DIR/bin/rnl_window"
BUNDLE_HBC="\$APP_DIR/bundle/t3code.linux.bundle.hbc"
BUNDLE_JS="\$APP_DIR/bundle/t3code.linux.bundle.js"

BUNDLE="\$BUNDLE_JS"
if [ -f "\$BUNDLE_HBC" ]; then
    BUNDLE="\$BUNDLE_HBC"
fi

# 1. Start Go daemon in background if not already running
if ! pgrep -f "\$SERVER_BIN" > /dev/null 2>&1; then
    echo "[t3code-native] Starting Go backend daemon (t3server)..."
    "\$SERVER_BIN" > /tmp/t3server.log 2>&1 &
    sleep 0.2
fi

# 2. Launch native Wayland Vulkan React Native window
echo "[t3code-native] Launching native Wayland window (Optimized Release with Hermes Bytecode)..."
exec "\$WINDOW_BIN" \\
    --fabric "\$BUNDLE" \\
    --title "T3 Code" \\
    --app-id "t3code-native" \\
    "\$@"
`;

const launcherPath = path.join(BIN_DIR, 't3code-native');
fs.writeFileSync(launcherPath, launcherScript, { mode: 0o755 });

// 6. Install desktop icon
console.log('--> Installing icon...');
const iconSrc = path.join(ICONS_DIR, 'com.t3tools.T3Code.desktop.png');
const iconDst = path.join(ICONS_DIR, 't3code-native.png');
if (fs.existsSync(iconSrc) && !fs.existsSync(iconDst)) {
  fs.copyFileSync(iconSrc, iconDst);
}

// 7. Install XDG desktop entry
console.log('--> Installing XDG desktop entry...');
const desktopEntry = `[Desktop Entry]
Type=Application
Name=T3 Code Native
GenericName=AI Coding Assistant
Comment=T3 Code Native - React Native Desktop Client for AI Coding Agents
Exec=${launcherPath} %U
Icon=${iconDst}
Terminal=false
Categories=Development;IDE;
StartupWMClass=t3code-native
Keywords=t3code;code;agent;ai;react-native;
`;
const desktopPath = path.join(APPS_DIR, 't3code-native.desktop');
fs.writeFileSync(desktopPath, desktopEntry);

// 8. Update desktop database
try {
  execSync('update-desktop-database ~/.local/share/applications', { stdio: 'ignore' });
} catch {}

console.log('\\n[SUCCESS] T3 Code Native is installed to your laptop!');
console.log('  * Terminal command: t3code-native');
console.log('  * Application Menu: T3 Code Native');
console.log('  * Bundled Server   : ~/.local/share/t3code-native/server/bin/t3server (auto-managed)\\n');
