export type ProviderId = 'claude' | 'codex' | 'cursor' | 'grok' | 'opencode' | 'antigravity' | string;

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  isLegacy?: boolean;
  badge?: 'new' | 'reasoning' | 'thinking' | 'fast';
  capabilities?: string[];
  contextWindow?: string;
  subProvider?: string;
  isCustom?: boolean;
}

export interface ProviderEnvVar {
  id: string;
  name: string;
  value: string;
  sensitive: boolean;
}

export interface ProviderInfo {
  id: string;
  name: string;
  displayName?: string;
  badge: string;
  iconColor: string;
  driverKind: ProviderId;
  version?: string;
  isConfigured: boolean;
  isEnabled: boolean;
  authStatus: 'authenticated' | 'needs_login' | 'disabled';
  authEmail?: string;
  binaryPath?: string;
  cliDetected?: boolean;
  cliArguments?: string;
  environmentVariables?: ProviderEnvVar[];
  models: ModelInfo[];
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
  theme: 'dark' | 'light' | 'midnight' | 'system';
  contrast: number;
  glassOpacity: number;
  fontFamily: 'default' | 'jetbrains' | 'system';
  fontSize: number;
  codeFontFamily: string;
  codeFontSize: number;
  interfaceFontSize: number;
  terminalFontSize: number;
  responseStreamingMode: 'streamed' | 'batched';
  autoSettleAfterDays: number;
  confirmThreadArchive: boolean;
  confirmThreadDelete: boolean;
  confirmQuit: boolean;
  serverUrl: string;
  authToken: string;
  autoConnect: boolean;
  enableThinkingAnimation: boolean;
  soundEffects: boolean;
  compactMode: boolean;
}
