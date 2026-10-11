import { Project, Thread, Message, Turn, FileDiff, WorkspaceFile, ProviderInfo, ServerEnvironment } from '../types';

export const initialProviders: ProviderInfo[] = [
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    badge: 'AG',
    iconColor: '#8b5cf6',
    isConfigured: true,
    authStatus: 'authenticated',
    models: [
      { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash High', description: 'Ultra fast reasoning & tool calling', isDefault: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Deep reasoning and complex refactoring' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude Code',
    badge: 'CL',
    iconColor: '#d97706',
    isConfigured: true,
    authStatus: 'authenticated',
    models: [
      { id: 'claude-3-7-sonnet-thinking', name: 'Claude 3.7 Sonnet (Thinking)', description: 'Hybrid fast/thinking reasoning agent', isDefault: true },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Industry standard for code generation' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', description: 'Lightweight and low latency' },
    ],
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    badge: 'CX',
    iconColor: '#10a37f',
    isConfigured: true,
    authStatus: 'authenticated',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'High-speed multimodal coding', isDefault: true },
      { id: 'o3-mini', name: 'o3-mini', description: 'Reasoning model optimized for coding' },
      { id: 'o1', name: 'o1', description: 'Full reasoning flagship model' },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor Agent',
    badge: 'CR',
    iconColor: '#6366f1',
    isConfigured: true,
    authStatus: 'authenticated',
    models: [
      { id: 'cursor-fast', name: 'Cursor Fast', description: 'Fast code editing model', isDefault: true },
      { id: 'claude-3-5-sonnet-cursor', name: 'Claude 3.5 Sonnet (Cursor)', description: 'Cursor-tuned Claude agent' },
    ],
  },
  {
    id: 'grok',
    name: 'Grok Build',
    badge: 'GK',
    iconColor: '#ec4899',
    isConfigured: false,
    authStatus: 'needs_login',
    models: [
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI coding model', isDefault: true },
    ],
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    badge: 'OC',
    iconColor: '#3b82f6',
    isConfigured: false,
    authStatus: 'needs_login',
    models: [
      { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'Open reasoning model', isDefault: true },
    ],
  },
];

export const initialEnvironments: ServerEnvironment[] = [
  {
    id: 'env-local',
    name: 'Local Workstation',
    type: 'local',
    host: 'localhost',
    port: 3773,
    isConnected: true,
    latencyMs: 2,
    version: '0.0.45',
  },
  {
    id: 'env-tailscale',
    name: 'Dev Machine (Tailscale)',
    type: 'tailscale',
    host: 'dev-box.tailnet.ts.net',
    port: 3773,
    isConnected: false,
    latencyMs: 38,
    version: '0.0.45',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 't3code-native',
    path: '/home/jack/workspace/t3code-native',
    icon: '⚡',
    branch: 'main',
    status: 'dirty',
    threadCount: 3,
    updatedAt: 'Just now',
  },
  {
    id: 'proj-2',
    name: 't3code',
    path: '/home/jack/workspace/t3code',
    icon: '🚀',
    branch: 'main',
    status: 'clean',
    threadCount: 12,
    updatedAt: '2 hours ago',
  },
  {
    id: 'proj-3',
    name: 'effect-agent-runtime',
    path: '/home/jack/workspace/effect-agent-runtime',
    icon: '✨',
    branch: 'feat/session-v2',
    status: 'ahead',
    threadCount: 4,
    updatedAt: '1 day ago',
  },
];

export const initialThreads: Thread[] = [
  {
    id: 'thread-1',
    projectId: 'proj-1',
    title: 'Rewrite t3code in React Native for desktop',
    provider: 'antigravity',
    model: 'gemini-3.8-flash-high',
    status: 'idle',
    unreadCount: 0,
    branch: 'main',
    createdAt: '10 mins ago',
    updatedAt: 'Just now',
  },
  {
    id: 'thread-2',
    projectId: 'proj-1',
    title: 'Design multi-column desktop layout & terminal drawer',
    provider: 'claude',
    model: 'claude-3-7-sonnet-thinking',
    status: 'idle',
    unreadCount: 0,
    branch: 'main',
    createdAt: '1 hour ago',
    updatedAt: '45 mins ago',
  },
  {
    id: 'thread-3',
    projectId: 'proj-1',
    title: 'Implement interactive Diff viewer with gutter staging',
    provider: 'cursor',
    model: 'cursor-fast',
    status: 'idle',
    unreadCount: 0,
    branch: 'feat/diff-panel',
    createdAt: '3 hours ago',
    updatedAt: '2 hours ago',
  },
];

export const initialMessages: Record<string, Message[]> = {
  'thread-1': [
    {
      id: 'msg-1',
      threadId: 'thread-1',
      role: 'user',
      content: 'please rewrite https://github.com/pingdotgg/t3code (git clone it first) in react native, for desktop',
      timestamp: '14:53:59',
      contextChips: [
        { id: 'c1', label: 'github.com/pingdotgg/t3code', type: 'git', value: 'https://github.com/pingdotgg/t3code' },
        { id: 'c2', label: 'desktop', type: 'directory', value: 'desktop' },
      ],
    },
    {
      id: 'msg-2',
      threadId: 'thread-1',
      role: 'assistant',
      content: `I have analyzed the T3 Code repository and designed a comprehensive **React Native Desktop rewrite** for T3 Code (\`t3code-native\`).

### Architecture Overview:
1. **React Native Desktop Core**: Built with React Native primitives (\`View\`, \`Text\`, \`TextInput\`, \`ScrollView\`, \`Pressable\`, \`StyleSheet\`) running seamlessly across desktop environments via Electron shell and React Native Web.
2. **Multi-Column Workspace**:
   - **Sidebar**: Environment picker, project workspace switcher, thread hierarchy, status pills, and global actions.
   - **Center Stage**: High performance chat timeline, reasoning collapsible views, interactive tool execution cards, rich markdown rendering, and desktop prompt composer with \`@\` mentions and model selector.
   - **Right Inspector Panel**: Collapsible inspector featuring live Git Diff viewer with chunk inspection, integrated terminal console, file tree, and checkpoint review.
3. **T3 Code Server Protocol**: Native WebSocket connection to \`ws://localhost:3773/ws\` with command dispatching, real-time event streaming, and offline preview simulation.`,
      timestamp: '14:54:30',
      turnId: 'turn-1',
    },
  ],
};

export const initialTurns: Record<string, Turn[]> = {
  'thread-1': [
    {
      id: 'turn-1',
      threadId: 'thread-1',
      status: 'completed',
      thoughts: '1. Inspect the cloned T3 Code structure (apps/web, apps/desktop, apps/mobile, packages/contracts).\n2. Note that desktop was previously an Electron app embedding web React DOM.\n3. Implement t3code-native in React Native for desktop using a cross-platform desktop shell.\n4. Build out the multi-column workspace, terminal, git diffs, chat transcript, tool execution cards, and composer.',
      timestamp: '14:54:10',
      toolCalls: [
        {
          id: 'tool-1',
          name: 'run_command',
          summary: 'git clone https://github.com/pingdotgg/t3code',
          parameters: { CommandLine: 'git clone https://github.com/pingdotgg/t3code /tmp/t3code' },
          status: 'success',
          result: 'Cloning into \'/tmp/t3code\'...\ndone.\n27,858 files unpacked.',
          durationMs: 4200,
          timestamp: '14:54:12',
        },
        {
          id: 'tool-2',
          name: 'run_command',
          summary: 'Inspect desktop & mobile architecture',
          parameters: { CommandLine: 'find /tmp/t3code/apps -maxdepth 2' },
          status: 'success',
          result: 'apps/desktop (Electron), apps/mobile (React Native Expo), apps/web (React DOM Vite)',
          durationMs: 120,
          timestamp: '14:54:18',
        },
        {
          id: 'tool-3',
          name: 'client_create_file',
          summary: 'Create React Native Desktop Application',
          parameters: { target_file: '/home/jack/workspace/t3code-native/src/App.tsx' },
          status: 'success',
          result: 'File created successfully (452 lines).',
          durationMs: 45,
          timestamp: '14:54:25',
        },
      ],
      checkpoint: {
        id: 'cp-1',
        turnId: 'turn-1',
        message: 'feat: initialize React Native desktop client architecture',
        commitHash: 'a7f3b8c',
        filesChanged: 14,
        timestamp: '14:54:30',
      },
    },
  ],
};

export const initialFileDiffs: FileDiff[] = [
  {
    path: 'src/App.tsx',
    status: 'modified',
    additions: 124,
    deletions: 18,
    isStaged: true,
    chunks: [
      {
        header: '@@ -12,8 +12,14 @@ import { StyleSheet, View } from "react-native";',
        oldStart: 12,
        oldCount: 8,
        newStart: 12,
        newCount: 14,
        lines: [
          { type: 'context', content: ' import React, { useState } from "react";', oldLine: 12, newLine: 12 },
          { type: 'delete', content: '-import { WebContainer } from "./web";', oldLine: 13 },
          { type: 'add', content: '+import { DesktopHeader } from "./components/layout/DesktopHeader";', newLine: 13 },
          { type: 'add', content: '+import { Sidebar } from "./components/layout/Sidebar";', newLine: 14 },
          { type: 'add', content: '+import { Inspector } from "./components/layout/Inspector";', newLine: 15 },
          { type: 'context', content: ' import { useAppStore } from "./state/useAppStore";', oldLine: 14, newLine: 16 },
        ],
      },
    ],
  },
  {
    path: 'electron/main.ts',
    status: 'added',
    additions: 82,
    deletions: 0,
    isStaged: false,
    chunks: [
      {
        header: '@@ -0,0 +1,82 @@',
        oldStart: 0,
        oldCount: 0,
        newStart: 1,
        newCount: 82,
        lines: [
          { type: 'add', content: '+import { app, BrowserWindow, ipcMain } from "electron";', newLine: 1 },
          { type: 'add', content: '+import path from "path";', newLine: 2 },
          { type: 'add', content: '+// Desktop window initialization', newLine: 3 },
          { type: 'add', content: '+function createWindow() {', newLine: 4 },
          { type: 'add', content: '+  const win = new BrowserWindow({ width: 1280, height: 840 });', newLine: 5 },
          { type: 'add', content: '+  win.loadURL("http://localhost:5173");', newLine: 6 },
          { type: 'add', content: '+};', newLine: 7 },
        ],
      },
    ],
  },
  {
    path: 'package.json',
    status: 'modified',
    additions: 15,
    deletions: 2,
    isStaged: true,
    chunks: [
      {
        header: '@@ -24,4 +24,17 @@',
        oldStart: 24,
        oldCount: 4,
        newStart: 24,
        newCount: 17,
        lines: [
          { type: 'delete', content: '-    "react-dom": "^18.0.0"', oldLine: 24 },
          { type: 'add', content: '+    "react-native-web": "^0.19.13",', newLine: 24 },
          { type: 'add', content: '+    "electron": "^34.5.8",', newLine: 25 },
          { type: 'add', content: '+    "zustand": "^5.0.15"', newLine: 26 },
        ],
      },
    ],
  },
];

export const initialWorkspaceFiles: WorkspaceFile[] = [
  {
    name: 'electron',
    path: 'electron',
    type: 'directory',
    children: [
      { name: 'main.ts', path: 'electron/main.ts', type: 'file', size: 2150 },
      { name: 'preload.ts', path: 'electron/preload.ts', type: 'file', size: 1040 },
    ],
  },
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      {
        name: 'components',
        path: 'src/components',
        type: 'directory',
        children: [
          { name: 'DesktopHeader.tsx', path: 'src/components/layout/DesktopHeader.tsx', type: 'file', size: 3400 },
          { name: 'Sidebar.tsx', path: 'src/components/layout/Sidebar.tsx', type: 'file', size: 6800 },
          { name: 'ChatView.tsx', path: 'src/components/chat/ChatView.tsx', type: 'file', size: 7200 },
          { name: 'Composer.tsx', path: 'src/components/composer/Composer.tsx', type: 'file', size: 5100 },
          { name: 'Inspector.tsx', path: 'src/components/layout/Inspector.tsx', type: 'file', size: 4900 },
          { name: 'DiffViewer.tsx', path: 'src/components/diff/DiffViewer.tsx', type: 'file', size: 6100 },
          { name: 'TerminalView.tsx', path: 'src/components/terminal/TerminalView.tsx', type: 'file', size: 4200 },
        ],
      },
      { name: 'types', path: 'src/types', type: 'directory' },
      { name: 'theme', path: 'src/theme', type: 'directory' },
      { name: 'state', path: 'src/state', type: 'directory' },
      { name: 'App.tsx', path: 'src/App.tsx', type: 'file', size: 5200 },
      { name: 'index.tsx', path: 'src/index.tsx', type: 'file', size: 890 },
    ],
  },
  { name: 'package.json', path: 'package.json', type: 'file', size: 1350 },
  { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file', size: 520 },
  { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file', size: 840 },
  { name: 'README.md', path: 'README.md', type: 'file', size: 3100 },
];
