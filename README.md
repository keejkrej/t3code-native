# T3 Code Native (Desktop & Go Backend Server)

A full rewrite of [T3 Code](https://github.com/pingdotgg/t3code):
1. **Frontend**: Desktop client rewritten in **React Native** (`View`, `Text`, `TextInput`, `ScrollView`, `Pressable`, `StyleSheet`) styled for desktop engineering workflows across Linux, macOS, and Windows via an Electron runtime and React Native Web.
2. **Backend**: Complete high-performance **Go server daemon** (`server/cmd/t3server`) implementing HTTP REST endpoints, bidirectional WebSocket streaming RPC (`/ws`), multi-provider agent orchestration, real workspace tool execution (`run_command`, `view_file`, `client_create_file`, `grep_search`), live git status and unified diff parsing, interactive terminal execution, and automatic checkpointing.

---

## Highlights & Features

### 1. High-Performance Go Backend Daemon (`server/`)
- **HTTP REST & WebSocket RPC**:
  - `GET /health` & `GET /api/health`: Health monitoring, uptime, platform diagnostics.
  - `GET /api/projects` & `POST /api/projects`: Project registration & branch discovery.
  - `GET /api/diffs`: Unified git diff generation with parsed chunk headers, line numbers, and addition/deletion counts.
  - `GET /api/files` & `GET /api/files/read`: Recursive workspace directory tree and file reading.
  - `GET /api/providers`: Model catalogs, badges, and authentication status.
  - `GET /api/terminal/history` & `POST /api/terminal/exec`: Shell command execution with streaming logs.
  - `GET /ws`: High-speed bidirectional WebSocket RPC supporting both native desktop client events and upstream orchestration contracts.
- **Orchestration Engine**:
  - Thread lifecycle management (`create_thread`, `delete_thread`, `list_threads`).
  - Agent turn runner with streaming reasoning / thoughts (`thinking` events).
  - Real workspace tool execution:
    - `run_command`: Executes shell commands in project CWD with timeout and stdout/stderr capture.
    - `view_file`: Safely reads files with line range slicing (`start_line`, `end_line`).
    - `client_create_file` & `client_edit_file`: Creates and updates workspace files.
    - `grep_search`: Fast pattern search across the workspace.
    - `list_dir`: Directory listing with metadata.
  - Automatic git checkpoint generation with commit hashes and file change tracking.
- **Git & VCS Engine**:
  - Live branch detection and status tracking (`clean`, `dirty`, `ahead`, `syncing`).
  - Unified diff parser mapping raw git diffs to `FileDiff`, `DiffChunk`, and `DiffLine` structures.
  - File staging (`git add`), unstaging (`git restore --staged`), and reverting (`git checkout --`).

### 2. Multi-Column Desktop Workspace (React Native)
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

### 3. Multi-Provider AI Agent Support
Full model configurations and state management for leading coding agents:
- **Google Antigravity**: Gemini 3.8 Flash High & Gemini 2.5 Pro
- **Claude Code**: Claude 3.7 Sonnet (Thinking), Claude 3.5 Sonnet, Claude 3.5 Haiku
- **OpenAI Codex**: GPT-4o, o3-mini, o1
- **Cursor Agent**: Cursor Fast, Claude 3.5 Sonnet (Cursor)
- **Grok Build**: Grok Beta
- **OpenCode**: DeepSeek R1

### 4. Desktop Shortcuts & Productivity
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
├── server/                       # Go Backend Server Daemon
│   ├── cmd/
│   │   └── t3server/
│   │       └── main.go           # CLI entrypoint, flags, graceful shutdown
│   ├── internal/
│   │   ├── config/               # CLI flags and runtime configuration
│   │   │   └── config.go
│   │   ├── git/                  # Git status, unified diff parser & checkpoints
│   │   │   ├── git.go
│   │   │   └── git_test.go
│   │   ├── http/                 # REST routes, health checks & CORS
│   │   │   ├── router.go
│   │   │   └── router_test.go
│   │   ├── models/               # Shared domain data models
│   │   │   └── types.go
│   │   ├── orchestrator/         # Agent orchestration, turns, tools & providers
│   │   │   ├── engine.go
│   │   │   ├── engine_test.go
│   │   │   ├── providers.go
│   │   │   └── tools.go
│   │   ├── terminal/             # Interactive terminal manager
│   │   │   ├── manager.go
│   │   │   └── manager_test.go
│   │   ├── workspace/            # Directory scanner & file content reader
│   │   │   ├── files.go
│   │   │   └── files_test.go
│   │   └── ws/                   # Bidirectional WebSocket hub & event streaming
│   │       ├── client.go
│   │       ├── handlers.go
│   │       ├── hub.go
│   │       └── hub_test.go
│   ├── go.mod
│   └── go.sum
├── src/
│   ├── components/
│   │   ├── chat/                 # Transcript, thinking accordion, tool cards
│   │   ├── composer/             # Prompt composer, chips, model switcher
│   │   ├── diff/                 # Unified diff viewer & staging
│   │   ├── files/                # File tree & file preview
│   │   ├── layout/               # Header, sidebar, inspector
│   │   ├── modals/               # Command palette, settings, new thread
│   │   ├── terminal/             # Terminal emulator
│   │   └── ui/                   # Button, Badge, Icon adapters
│   ├── services/
│   │   ├── mockData.ts           # Fallback offline data
│   │   └── t3Client.ts           # WebSocket connection & turn runner
│   ├── state/
│   │   └── useAppStore.ts        # Zustand application state
│   ├── theme/
│   │   └── index.ts              # Design tokens & color system
│   ├── types/
│   │   └── index.ts              # Data contracts & domain types
│   ├── App.tsx                   # Top-level desktop layout & shortcuts
│   └── index.tsx                 # AppRegistry desktop entrypoint
├── index.html                    # Root HTML shell
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### 1. Build & Run the Go Backend Server
```bash
# Build the Go server daemon binary
pnpm server:build

# Run all Go unit and integration tests
pnpm server:test

# Start the Go server daemon on port 3773
pnpm server:run
```

To run on a custom port or workspace:
```bash
./server/bin/t3server --port 3773 --cwd /path/to/project
```

### 2. Run the React Native Desktop Client
```bash
# Install dependencies
pnpm install

# Start Vite dev server for web preview
pnpm dev

# Build both Web and Electron bundles
pnpm build

# Launch the desktop Electron application
pnpm desktop
```
