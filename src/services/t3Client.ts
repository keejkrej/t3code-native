import { Message, Turn, ToolCall } from '../types';

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
    // Default to connecting
  }

  public connect(url: string = this.url) {
    this.url = url;
    this.shouldAutoReconnect = true;
    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        // Handshake
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
    }, 4000);
  }

  public send(payload: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
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

  /**
   * Simulated Agent Turn for interactive standalone desktop testing
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
        thoughts: `Analyzing prompt: "${prompt}"\nInvestigating project context and available tools...`,
        toolCalls: [],
        timestamp,
      },
    });

    // Step 2: First tool call
    setTimeout(() => {
      const toolCall1: ToolCall = {
        id: `tool-${Date.now()}-1`,
        name: 'run_command',
        summary: `Execute checks for ${provider}`,
        parameters: { CommandLine: 'git status --short' },
        status: 'running',
        timestamp,
      };

      onProgress({
        turn: {
          id: turnId,
          status: 'running',
          thoughts: `Analyzing prompt: "${prompt}"\nInvestigating project context and available tools...\nChecking repository status and staged diffs.`,
        },
        toolCall: toolCall1,
      });

      // Complete tool 1
      setTimeout(() => {
        toolCall1.status = 'success';
        toolCall1.result = 'M src/App.tsx\nA electron/main.ts\nM package.json';
        toolCall1.durationMs = 85;

        onProgress({
          toolCall: toolCall1,
        });

        // Step 3: Second tool call
        setTimeout(() => {
          const toolCall2: ToolCall = {
            id: `tool-${Date.now()}-2`,
            name: 'client_create_file',
            summary: 'Update desktop component tree',
            parameters: { target_file: 'src/components/chat/ChatView.tsx' },
            status: 'running',
            timestamp,
          };

          onProgress({ toolCall: toolCall2 });

          setTimeout(() => {
            toolCall2.status = 'success';
            toolCall2.result = 'Wrote 184 lines to src/components/chat/ChatView.tsx';
            toolCall2.durationMs = 120;
            onProgress({ toolCall: toolCall2 });

            // Step 4: Assistant Message & Checkpoint
            setTimeout(() => {
              const completedMessage: Message = {
                id: `msg-${Date.now()}`,
                threadId,
                role: 'assistant',
                content: `I've processed your request: **"${prompt}"**.\n\nAll tools executed cleanly:
- Ran \`git status --short\` to verify branch cleanliness.
- Created and synchronized native desktop components.
- State is synced and ready in your workspace!`,
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
            }, 600);
          }, 700);
        }, 500);
      }, 700);
    }, 800);
  }
}

export const t3Client = new T3ClientService();
