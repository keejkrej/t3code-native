# T3 Code Native (Desktop)

A rewrite of [T3 Code](https://github.com/pingdotgg/t3code) in **React Native** for desktop.

Built using React Native primitives (`View`, `Text`, `TextInput`, `ScrollView`, `Pressable`, `StyleSheet`) and styled for desktop software engineering workflows across Linux, macOS, and Windows via an Electron runtime and React Native Web.

---

## Highlights & Features

### 1. Multi-Column Desktop Workspace
- **Header & Titlebar**: Project workspace breadcrumbs, git branch status, dirty indicators, active environment connection pill, quick search trigger (`Ctrl+K`), and layout toggles.
- **Left Sidebar**: Workspace directory picker, filterable conversations list with provider tags, unread markers, and rapid thread creation (`Ctrl+N`).
- **Center Stage**:
  - Chat transcript with message bubbles and user avatars.
  - Collapsible **Reasoning / Thinking Process** accordion with live pulse animations.
  - Expandable **Tool Execution Cards** for commands (`run_command`), file inspection (`view_file`), file creation/editing (`client_create_file`), and searches (`grep_search`).
  - GitHub-flavored Markdown rendering with syntax-styled code blocks and copy buttons.
  - Multi-line desktop **Composer** with `@file` / `@diff` context chips, model switcher modal, and fast keyboard shortcuts (`Enter` to submit, `Shift+Enter` for newline).
- **Right Inspector Panel**:
  - **Changes (Diffs)**: Unified diff viewer with gutter line numbering, additions/deletions statistics, and per-file stage/unstage/revert controls.
  - **Terminal**: Interactive shell console with command execution, colored output streams, and preset shortcut chips (`git status`, `pnpm test`, `pnpm build`).
  - **Files**: Workspace directory explorer with in-app file previewing.
  - **Review**: Checkpoint history with commit hashes and file change counters.

### 2. Multi-Provider AI Agent Support
Full model configurations and state management for leading coding agents:
- **Google Antigravity**: Gemini 3.8 Flash High & Gemini 2.5 Pro
- **Claude Code**: Claude 3.7 Sonnet (Thinking), Claude 3.5 Sonnet, Claude 3.5 Haiku
- **OpenAI Codex**: GPT-4o, o3-mini, o1
- **Cursor Agent**: Cursor Fast, Claude 3.5 Sonnet (Cursor)
- **Grok Build**: Grok Beta
- **OpenCode**: DeepSeek R1

### 3. Desktop Shortcuts & Productivity
- `Ctrl + K` / `Cmd + K`: Command Palette (jump to threads, execute actions, switch panels)
- `Ctrl + N` / `Cmd + N`: New Thread dialog
- `Ctrl + B` / `Cmd + B`: Toggle Sidebar
- `Ctrl + J` / `Cmd + J`: Toggle Right Inspector
- `Ctrl + ,` / `Cmd + ,`: Open Settings

---

## Architecture & Codebase Map

```
t3code-native/
├── electron/
│   ├── main.ts                   # Desktop window manager & native IPC
│   └── preload.ts                # Context bridge & secure desktop APIs
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatView.tsx      # Main conversation transcript
│   │   │   ├── MarkdownRenderer.tsx # RN Markdown parser & code blocks
│   │   │   ├── ThinkingAccordion.tsx # Reasoning step collapsible
│   │   │   └── ToolCallCard.tsx  # Tool execution status & stdout cards
│   │   ├── composer/
│   │   │   ├── Composer.tsx      # Multi-line prompt input & context chips
│   │   │   └── ModelPickerModal.tsx # Provider & model selection modal
│   │   ├── diff/
│   │   │   └── DiffViewer.tsx    # Unified git diff viewer & staging
│   │   ├── files/
│   │   │   └── FileTree.tsx      # Workspace file tree & file preview
│   │   ├── layout/
│   │   │   ├── DesktopHeader.tsx # Top window bar & breadcrumbs
│   │   │   ├── Inspector.tsx     # Right collapsible panel container
│   │   │   └── Sidebar.tsx       # Conversations & project navigator
│   │   ├── modals/
│   │   │   ├── CommandPalette.tsx # Global action & search palette
│   │   │   ├── NewThreadModal.tsx # New conversation modal
│   │   │   └── SettingsModal.tsx # Preferences, providers & servers
│   │   ├── terminal/
│   │   │   └── TerminalView.tsx  # Interactive terminal emulator
│   │   └── ui/
│   │       ├── Badge.tsx         # Pill & counter badges
│   │       ├── Button.tsx        # Pressable with hover & variants
│   │       └── Icon.tsx          # Lucide SVG icon adapter
│   ├── services/
│   │   ├── mockData.ts           # Sample projects, diffs, turns & threads
│   │   └── t3Client.ts           # WebSocket client & simulation engine
│   ├── state/
│   │   └── useAppStore.ts        # Zustand application state
│   ├── theme/
│   │   └── index.ts              # Design tokens & color system
│   ├── types/
│   │   ├── index.ts              # Data contracts & domain types
│   │   └── react-native.d.ts     # React Native type definitions
│   ├── App.tsx                   # Top-level desktop layout & shortcuts
│   └── index.tsx                 # AppRegistry desktop entrypoint
├── index.html                    # Root HTML shell
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/keejkrej/t3code-native.git
cd t3code-native

# Install dependencies
pnpm install
```

### 2. Development

Run the Vite development server:

```bash
pnpm dev
```

### 3. Production Build

Build both the React Native web bundle and the Electron desktop bundle:

```bash
pnpm build
```

This compiles:
- `dist/index.html` & `dist/assets/index.js` (Web runtime)
- `dist-electron/main.cjs` & `dist-electron/preload.cjs` (Electron desktop runtime)

### 4. Running the Desktop Application

```bash
pnpm desktop
```

### 5. Type Checking

Validate TypeScript types across the entire project:

```bash
pnpm typecheck
```

---

## Server Orchestrator Connection

By default, T3 Code Native connects to `ws://localhost:3773/ws`. You can configure the endpoint in **Settings (`Ctrl+,`)** -> **Server & Sync**, supporting local orchestrator instances as well as remote instances via Tailscale or SSH tunnels. If disconnected, the app automatically runs in interactive demo mode with full simulation capabilities.
