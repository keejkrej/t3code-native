import { Message, Turn, ToolCall, ContextChip } from '../types';

export type T3ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'demo';

type MessageHandler = (data: any) => void;
type StatusHandler = (status: T3ConnectionStatus) => void;

class T3ClientService {
  private ws: WebSocket | null = null;
  private url: string = 'ws://localhost:3773/ws';
  private status: T3ConnectionStatus = 'disconnected';
  private messageListeners: Set<MessageHandler> = new Set();
  private statusListeners: Set<StatusHandler> = new Set();
  private reconnectTimer: any = null;
  private shouldAutoReconnect: boolean = true;

  constructor() {
    // Default URL can be overridden
  }

  public connect(url: string = this.url) {
    this.url = url;
    this.shouldAutoReconnect = true;
    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        // Handshake with Go server
        this.send({
          type: 'client_hello',
          client: 't3code-native-desktop',
          version: '1.0.0',
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyMessage(data);
        } catch (e) {
          console.warn('[T3Client] Failed to parse message:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        if (this.shouldAutoReconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.setStatus('disconnected');
      };
    } catch {
      this.setStatus('disconnected');
    }
  }

  public disconnect() {
    this.shouldAutoReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldAutoReconnect && this.status === 'disconnected') {
        this.connect(this.url);
      }
    }, 3000);
  }

  public send(payload: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  public isConnected(): boolean {
    return this.status === 'connected' && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public onMessage(handler: MessageHandler) {
    this.messageListeners.add(handler);
    return () => this.messageListeners.delete(handler);
  }

  public onStatus(handler: StatusHandler) {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => this.statusListeners.delete(handler);
  }

  private setStatus(status: T3ConnectionStatus) {
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  private notifyMessage(data: any) {
    for (const listener of this.messageListeners) {
      listener(data);
    }
  }

  public getStatus(): T3ConnectionStatus {
    return this.status;
  }

  // --- Real-time Go Server RPC Actions ---

  public sendTurnStart(
    threadId: string,
    prompt: string,
    contextChips?: ContextChip[],
    provider?: string,
    model?: string
  ): boolean {
    return this.send({
      type: 'turn.start',
      payload: {
        threadId,
        content: prompt,
        contextChips: contextChips || [],
        provider: provider || 'antigravity',
        model: model || 'gemini-3.8-flash-high',
      },
    });
  }

  public sendTerminalExec(command: string): boolean {
    return this.send({
      type: 'terminal.exec',
      payload: { command },
    });
  }

  public sendStageDiff(path: string): boolean {
    return this.send({
      type: 'diffs.stage',
      payload: { path },
    });
  }

  public sendRevertDiff(path: string): boolean {
    return this.send({
      type: 'diffs.revert',
      payload: { path },
    });
  }

  public sendRefreshDiffs(): boolean {
    return this.send({
      type: 'diffs.get',
      payload: {},
    });
  }

  public sendCreateThread(projectId: string, title: string, provider: string, model: string): boolean {
    return this.send({
      type: 'thread.create',
      payload: { projectId, title, provider, model },
    });
  }

  public sendDeleteThread(threadId: string): boolean {
    return this.send({
      type: 'thread.delete',
      payload: { threadId },
    });
  }

  /**
   * Simulated Agent Turn fallback when running offline without the Go server
   */
  public simulateTurn(
    threadId: string,
    prompt: string,
    provider: string,
    onProgress: (update: {
      turn?: Partial<Turn>;
      toolCall?: ToolCall;
      messageChunk?: string;
      completedMessage?: Message;
    }) => void
  ) {
    const turnId = `turn-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1: Thinking
    onProgress({
      turn: {
        id: turnId,
        threadId,
        status: 'thinking',
        thoughts: `Analyzing prompt: "${prompt}"\nInvestigating workspace context and available tools...`,
        toolCalls: [],
        timestamp,
      },
    });

    // Step 2: First tool call
    setTimeout(() => {
      const toolCall1: ToolCall = {
        id: `tool-${Date.now()}-1`,
        name: 'run_command',
        summary: `Execute workspace checks for ${provider}`,
        parameters: { CommandLine: 'git status --short' },
        status: 'running',
        timestamp,
      };

      onProgress({
        turn: {
          id: turnId,
          status: 'running',
          thoughts: `Analyzing prompt: "${prompt}"\nInvestigating workspace context and available tools...\nChecking repository status and staged diffs.`,
        },
        toolCall: toolCall1,
      });

      // Complete tool 1
      setTimeout(() => {
        toolCall1.status = 'success';
        toolCall1.result = 'M src/App.tsx\nA server/cmd/t3server/main.go\nM package.json';
        toolCall1.durationMs = 85;

        onProgress({
          toolCall: toolCall1,
        });

        // Step 3: Second tool call
        setTimeout(() => {
          const toolCall2: ToolCall = {
            id: `tool-${Date.now()}-2`,
            name: 'client_create_file',
            summary: 'Synchronize Go backend with React Native desktop',
            parameters: { target_file: 'src/services/t3Client.ts' },
            status: 'running',
            timestamp,
          };

          onProgress({ toolCall: toolCall2 });

          setTimeout(() => {
            toolCall2.status = 'success';
            toolCall2.result = 'Wrote 240 lines to src/services/t3Client.ts';
            toolCall2.durationMs = 120;
            onProgress({ toolCall: toolCall2 });

            // Step 4: Assistant Message & Checkpoint
            setTimeout(() => {
              const completedMessage: Message = {
                id: `msg-${Date.now()}`,
                threadId,
                role: 'assistant',
                content: `I've processed your request: **"${prompt}"**.\n\nAll tools executed cleanly:\n- Ran \`git status --short\` to verify branch cleanliness.\n- Synchronized Go backend daemon with React Native desktop client.\n- State is synced and ready in your workspace!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                turnId,
              };

              onProgress({
                turn: {
                  id: turnId,
                  status: 'completed',
                  checkpoint: {
                    id: `cp-${Date.now()}`,
                    turnId,
                    message: `turn: ${prompt.slice(0, 32)}...`,
                    commitHash: Math.random().toString(16).substring(2, 9),
                    filesChanged: 2,
                    timestamp,
                  },
                },
                completedMessage,
              });
            }, 500);
          }, 600);
        }, 400);
      }, 500);
    }, 600);
  }
}

export const t3Client = new T3ClientService();
