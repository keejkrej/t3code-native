import { create } from 'zustand';
import {
  Project,
  Thread,
  Message,
  Turn,
  FileDiff,
  WorkspaceFile,
  ProviderInfo,
  ProviderId,
  AppSettings,
  ServerEnvironment,
  TerminalLine,
  ContextChip,
} from '../types';
import {
  initialProjects,
  initialThreads,
  initialMessages,
  initialTurns,
  initialFileDiffs,
  initialWorkspaceFiles,
  initialProviders,
  initialEnvironments,
} from '../services/mockData';
import { t3Client, T3ConnectionStatus } from '../services/t3Client';

export interface AppState {
  // Navigation & Hierarchy
  projects: Project[];
  activeProjectId: string;
  threads: Thread[];
  activeThreadId: string;

  // Conversations
  messages: Record<string, Message[]>;
  turns: Record<string, Turn[]>;
  isGenerating: boolean;

  // Inspector Panels
  activeInspectorTab: 'diffs' | 'terminal' | 'files' | 'review';
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  fileDiffs: FileDiff[];
  selectedDiffFile: string | null;
  workspaceFiles: WorkspaceFile[];
  selectedFileContent: { path: string; content: string } | null;

  // Terminal
  terminalLines: TerminalLine[];

  // Providers & Models
  providers: ProviderInfo[];
  selectedProvider: ProviderId;
  selectedModel: string;

  // Modals & Sheets
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;
  isNewThreadModalOpen: boolean;
  isModelPickerOpen: boolean;

  // Settings & Connection
  settings: AppSettings;
  environments: ServerEnvironment[];
  currentEnvironmentId: string;
  connectionStatus: T3ConnectionStatus;

  // Actions
  setActiveProject: (projectId: string) => void;
  setActiveThread: (threadId: string) => void;
  createThread: (title: string, provider: ProviderId, model: string) => string;
  deleteThread: (threadId: string) => void;
  sendMessage: (content: string, contextChips?: ContextChip[]) => void;
  cancelGeneration: () => void;

  toggleSidebar: () => void;
  toggleInspector: () => void;
  setInspectorTab: (tab: 'diffs' | 'terminal' | 'files' | 'review') => void;
  setSelectedDiffFile: (path: string | null) => void;
  toggleStageDiff: (path: string) => void;
  revertDiff: (path: string) => void;

  selectWorkspaceFile: (path: string) => void;
  closeFilePreview: () => void;

  executeTerminalCommand: (command: string) => void;
  clearTerminal: () => void;

  setSelectedProvider: (provider: ProviderId) => void;
  setSelectedModel: (model: string) => void;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openNewThreadModal: () => void;
  closeNewThreadModal: () => void;
  openModelPicker: () => void;
  closeModelPicker: () => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  connectToServer: (url?: string) => void;
  setConnectionStatus: (status: T3ConnectionStatus) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: initialProjects,
  activeProjectId: initialProjects[0].id,
  threads: initialThreads,
  activeThreadId: initialThreads[0].id,

  messages: initialMessages,
  turns: initialTurns,
  isGenerating: false,

  activeInspectorTab: 'diffs',
  isSidebarOpen: true,
  isInspectorOpen: true,
  fileDiffs: initialFileDiffs,
  selectedDiffFile: initialFileDiffs[0]?.path ?? null,
  workspaceFiles: initialWorkspaceFiles,
  selectedFileContent: null,

  terminalLines: [
    { id: 'term-1', type: 'system', text: 'T3 Code Native Desktop Terminal v1.0.0', timestamp: Date.now() - 60000 },
    { id: 'term-2', type: 'system', text: 'Connected to local agent harness environment (/home/jack/workspace/t3code-native)', timestamp: Date.now() - 59000 },
    { id: 'term-3', type: 'input', text: 'git status', timestamp: Date.now() - 58000 },
    { id: 'term-4', type: 'output', text: 'On branch main\nChanges not staged for commit:\n  modified:   src/App.tsx\n  modified:   package.json\nUntracked files:\n  electron/main.ts', timestamp: Date.now() - 57000 },
  ],

  providers: initialProviders,
  selectedProvider: 'antigravity',
  selectedModel: 'gemini-3.8-flash-high',

  isCommandPaletteOpen: false,
  isSettingsOpen: false,
  isNewThreadModalOpen: false,
  isModelPickerOpen: false,

  settings: {
    theme: 'dark',
    fontFamily: 'default',
    fontSize: 13,
    serverUrl: 'ws://localhost:3773/ws',
    authToken: '',
    autoConnect: true,
    enableThinkingAnimation: true,
    soundEffects: false,
    compactMode: false,
  },
  environments: initialEnvironments,
  currentEnvironmentId: 'env-local',
  connectionStatus: 'connected',

  setActiveProject: (projectId: string) => {
    const projectThreads = get().threads.filter((t) => t.projectId === projectId);
    set({
      activeProjectId: projectId,
      activeThreadId: projectThreads[0]?.id || '',
    });
  },

  setActiveThread: (threadId: string) => {
    set({ activeThreadId: threadId });
  },

  createThread: (title: string, provider: ProviderId, model: string) => {
    const { activeProjectId, threads } = get();
    const newThreadId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newThreadId,
      projectId: activeProjectId,
      title: title || 'New Conversation',
      provider,
      model,
      status: 'idle',
      unreadCount: 0,
      branch: 'main',
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };

    set({
      threads: [newThread, ...threads],
      activeThreadId: newThreadId,
      isNewThreadModalOpen: false,
    });

    return newThreadId;
  },

  deleteThread: (threadId: string) => {
    const { threads, activeThreadId } = get();
    const updatedThreads = threads.filter((t) => t.id !== threadId);
    set({
      threads: updatedThreads,
      activeThreadId: activeThreadId === threadId ? updatedThreads[0]?.id || '' : activeThreadId,
    });
  },

  sendMessage: (content: string, contextChips?: ContextChip[]) => {
    const { activeThreadId, messages, turns, selectedProvider, selectedModel } = get();
    if (!content.trim() || !activeThreadId) return;

    const userMsgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: userMsgId,
      threadId: activeThreadId,
      role: 'user',
      content,
      timestamp,
      contextChips,
    };

    const threadMessages = messages[activeThreadId] || [];
    set({
      messages: {
        ...messages,
        [activeThreadId]: [...threadMessages, userMessage],
      },
      isGenerating: true,
    });

    // Run simulated or live agent turn
    t3Client.simulateTurn(
      activeThreadId,
      content,
      selectedProvider,
      ({ turn, toolCall, completedMessage }) => {
        const state = get();
        const currentThreadTurns = state.turns[activeThreadId] || [];

        let updatedTurns = [...currentThreadTurns];

        if (turn?.id) {
          const existingTurnIndex = updatedTurns.findIndex((t) => t.id === turn.id);
          if (existingTurnIndex >= 0) {
            const existing = updatedTurns[existingTurnIndex];
            const updatedToolCalls = toolCall
              ? [...existing.toolCalls.filter((tc) => tc.id !== toolCall.id), toolCall]
              : existing.toolCalls;

            updatedTurns[existingTurnIndex] = {
              ...existing,
              ...turn,
              toolCalls: updatedToolCalls,
            };
          } else {
            updatedTurns.push({
              id: turn.id,
              threadId: activeThreadId,
              status: turn.status || 'running',
              thoughts: turn.thoughts || '',
              toolCalls: toolCall ? [toolCall] : [],
              checkpoint: turn.checkpoint,
              timestamp: turn.timestamp || timestamp,
            });
          }
        } else if (toolCall) {
          const lastTurn = updatedTurns[updatedTurns.length - 1];
          if (lastTurn) {
            const tcIndex = lastTurn.toolCalls.findIndex((tc) => tc.id === toolCall.id);
            if (tcIndex >= 0) {
              lastTurn.toolCalls[tcIndex] = toolCall;
            } else {
              lastTurn.toolCalls.push(toolCall);
            }
          }
        }

        const newMessages = { ...state.messages };
        if (completedMessage) {
          const currentMsgs = newMessages[activeThreadId] || [];
          newMessages[activeThreadId] = [...currentMsgs, completedMessage];
        }

        const isFinished = turn?.status === 'completed' || turn?.status === 'failed';

        set({
          turns: {
            ...state.turns,
            [activeThreadId]: updatedTurns,
          },
          messages: newMessages,
          isGenerating: !isFinished,
        });

        // Also add tool activity to terminal if command was run
        if (toolCall && toolCall.name === 'run_command' && toolCall.status === 'success') {
          get().executeTerminalCommand(toolCall.parameters.CommandLine);
        }
      }
    );
  },

  cancelGeneration: () => {
    set({ isGenerating: false });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  toggleInspector: () => {
    set((state) => ({ isInspectorOpen: !state.isInspectorOpen }));
  },

  setInspectorTab: (tab) => {
    set({ activeInspectorTab: tab, isInspectorOpen: true });
  },

  setSelectedDiffFile: (path) => {
    set({ selectedDiffFile: path, isInspectorOpen: true, activeInspectorTab: 'diffs' });
  },

  toggleStageDiff: (path) => {
    set((state) => ({
      fileDiffs: state.fileDiffs.map((diff) =>
        diff.path === path ? { ...diff, isStaged: !diff.isStaged } : diff
      ),
    }));
  },

  revertDiff: (path) => {
    set((state) => ({
      fileDiffs: state.fileDiffs.filter((diff) => diff.path !== path),
      selectedDiffFile: state.fileDiffs.find((d) => d.path !== path)?.path ?? null,
    }));
  },

  selectWorkspaceFile: (path) => {
    // Generate simulated file preview content
    const sampleContent = `// File: ${path}\n// T3 Code Native Desktop preview\n\nexport const info = {\n  path: "${path}",\n  loadedAt: new Date().toISOString(),\n  ready: true,\n};\n`;
    set({
      selectedFileContent: { path, content: sampleContent },
      isInspectorOpen: true,
      activeInspectorTab: 'files',
    });
  },

  closeFilePreview: () => {
    set({ selectedFileContent: null });
  },

  executeTerminalCommand: (command) => {
    if (!command.trim()) return;
    const inputLine: TerminalLine = {
      id: `term-${Date.now()}-in`,
      type: 'input',
      text: command,
      timestamp: Date.now(),
    };

    let outputText = '';
    if (command.startsWith('git status')) {
      outputText = 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges to be committed:\n  modified:   src/App.tsx\n\nUntracked files:\n  electron/main.ts';
    } else if (command.startsWith('pnpm test')) {
      outputText = '✓ 42 tests passed (42 passed, 0 failed)\nTest Suites: 8 passed, 8 total\nSnapshots:   0 total\nTime:        1.24s';
    } else if (command.startsWith('pnpm build')) {
      outputText = 'vite v6.4.4 building for production...\n✓ 84 modules transformed.\ndist/index.html   0.82 kB\ndist/assets/index.js   248.16 kB\n✓ built in 340ms';
    } else {
      outputText = `[t3code-native] Executed: ${command}\nCompleted with exit code 0`;
    }

    const outputLine: TerminalLine = {
      id: `term-${Date.now()}-out`,
      type: 'output',
      text: outputText,
      timestamp: Date.now() + 50,
    };

    set((state) => ({
      terminalLines: [...state.terminalLines, inputLine, outputLine],
    }));
  },

  clearTerminal: () => {
    set({ terminalLines: [] });
  },

  setSelectedProvider: (provider) => {
    const providerObj = get().providers.find((p) => p.id === provider);
    const defaultModel = providerObj?.models[0]?.id || '';
    set({ selectedProvider: provider, selectedModel: defaultModel });
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model });
  },

  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  openNewThreadModal: () => set({ isNewThreadModalOpen: true }),
  closeNewThreadModal: () => set({ isNewThreadModalOpen: false }),

  openModelPicker: () => set({ isModelPickerOpen: true }),
  closeModelPicker: () => set({ isModelPickerOpen: false }),

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  connectToServer: (url) => {
    t3Client.connect(url);
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },
}));
