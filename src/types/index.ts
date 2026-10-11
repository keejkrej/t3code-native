export type ProviderId = 'claude' | 'codex' | 'cursor' | 'grok' | 'opencode' | 'antigravity';

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  badge: string;
  iconColor: string;
  models: { id: string; name: string; description: string; isDefault?: boolean }[];
  isConfigured: boolean;
  authStatus: 'authenticated' | 'needs_login' | 'disabled';
}

export interface Project {
  id: string;
  name: string;
  path: string;
  icon: string;
  branch: string;
  status: 'clean' | 'dirty' | 'ahead' | 'syncing';
  threadCount: number;
  updatedAt: string;
}

export interface Thread {
  id: string;
  projectId: string;
  title: string;
  provider: ProviderId;
  model: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  unreadCount: number;
  branch: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContextChip {
  id: string;
  label: string;
  type: 'file' | 'git' | 'docs' | 'issue' | 'directory';
  value: string;
}

export interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextChips?: ContextChip[];
  turnId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  summary: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: any;
  durationMs?: number;
  timestamp: string;
}

export interface Checkpoint {
  id: string;
  turnId: string;
  message: string;
  commitHash: string;
  filesChanged: number;
  timestamp: string;
}

export interface Turn {
  id: string;
  threadId: string;
  status: 'thinking' | 'running' | 'completed' | 'failed';
  thoughts?: string;
  toolCalls: ToolCall[];
  checkpoint?: Checkpoint;
  timestamp: string;
}

export interface DiffLine {
  type: 'context' | 'add' | 'delete';
  content: string;
  oldLine?: number;
  newLine?: number;
}

export interface DiffChunk {
  header: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  oldPath?: string;
  status: 'modified' | 'added' | 'deleted';
  additions: number;
  deletions: number;
  chunks: DiffChunk[];
  isStaged?: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
  timestamp: number;
}

export interface WorkspaceFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: WorkspaceFile[];
}

export interface ServerEnvironment {
  id: string;
  name: string;
  type: 'local' | 'tailscale' | 'ssh' | 'relay';
  host: string;
  port: number;
  isConnected: boolean;
  latencyMs?: number;
  version?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'midnight';
  fontFamily: 'default' | 'jetbrains' | 'system';
  fontSize: number;
  serverUrl: string;
  authToken: string;
  autoConnect: boolean;
  enableThinkingAnimation: boolean;
  soundEffects: boolean;
  compactMode: boolean;
}
