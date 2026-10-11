package models

import "time"

// ProviderId defines the supported AI agent provider identifiers
type ProviderId string

const (
	ProviderClaude      ProviderId = "claude"
	ProviderCodex       ProviderId = "codex"
	ProviderCursor      ProviderId = "cursor"
	ProviderGrok        ProviderId = "grok"
	ProviderOpenCode    ProviderId = "opencode"
	ProviderAntigravity ProviderId = "antigravity"
)

// ModelInfo describes a single model supported by a provider
type ModelInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsDefault   bool   `json:"isDefault,omitempty"`
}

// ProviderInfo represents agent provider status and model catalog
type ProviderInfo struct {
	ID           ProviderId  `json:"id"`
	Name         string      `json:"name"`
	Badge        string      `json:"badge"`
	IconColor    string      `json:"iconColor"`
	Models       []ModelInfo `json:"models"`
	IsConfigured bool        `json:"isConfigured"`
	AuthStatus   string      `json:"authStatus"` // authenticated, needs_login, disabled
}

// Project represents a project workspace tracked by the server
type Project struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Path        string `json:"path"`
	Icon        string `json:"icon"`
	Branch      string `json:"branch"`
	Status      string `json:"status"` // clean, dirty, ahead, syncing
	ThreadCount int    `json:"threadCount"`
	UpdatedAt   string `json:"updatedAt"`
}

// Thread represents a conversation thread scoped to a project
type Thread struct {
	ID          string     `json:"id"`
	ProjectID   string     `json:"projectId"`
	Title       string     `json:"title"`
	Provider    ProviderId `json:"provider"`
	Model       string     `json:"model"`
	Status      string     `json:"status"` // idle, running, paused, error
	UnreadCount int        `json:"unreadCount"`
	Branch      string     `json:"branch"`
	CreatedAt   string     `json:"createdAt"`
	UpdatedAt   string     `json:"updatedAt"`
}

// ContextChip represents attached context chips (@file, @git, @directory, etc.)
type ContextChip struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Type  string `json:"type"` // file, git, docs, issue, directory
	Value string `json:"value"`
}

// Message represents a message in a conversation thread
type Message struct {
	ID           string        `json:"id"`
	ThreadID     string        `json:"threadId"`
	Role         string        `json:"role"` // user, assistant, system
	Content      string        `json:"content"`
	Timestamp    string        `json:"timestamp"`
	ContextChips []ContextChip `json:"contextChips,omitempty"`
	TurnID       string        `json:"turnId,omitempty"`
}

// ToolCall represents an executed or executing tool call
type ToolCall struct {
	ID         string         `json:"id"`
	Name       string         `json:"name"`
	Summary    string         `json:"summary"`
	Parameters map[string]any `json:"parameters"`
	Status     string         `json:"status"` // pending, running, success, failed
	Result     any            `json:"result,omitempty"`
	DurationMs int64          `json:"durationMs,omitempty"`
	Timestamp  string         `json:"timestamp"`
}

// Checkpoint represents a git/workspace state checkpoint recorded after a turn
type Checkpoint struct {
	ID           string `json:"id"`
	TurnID       string `json:"turnId"`
	Message      string `json:"message"`
	CommitHash   string `json:"commitHash"`
	FilesChanged int    `json:"filesChanged"`
	Timestamp    string `json:"timestamp"`
}

// Turn represents an execution turn in a thread
type Turn struct {
	ID         string      `json:"id"`
	ThreadID   string      `json:"threadId"`
	Status     string      `json:"status"` // thinking, running, completed, failed
	Thoughts   string      `json:"thoughts,omitempty"`
	ToolCalls  []ToolCall  `json:"toolCalls"`
	Checkpoint *Checkpoint `json:"checkpoint,omitempty"`
	Timestamp  string      `json:"timestamp"`
}

// DiffLine represents a single line in a diff hunk
type DiffLine struct {
	Type    string `json:"type"` // context, add, delete
	Content string `json:"content"`
	OldLine *int   `json:"oldLine,omitempty"`
	NewLine *int   `json:"newLine,omitempty"`
}

// DiffChunk represents a hunk within a file diff
type DiffChunk struct {
	Header   string     `json:"header"`
	OldStart int        `json:"oldStart"`
	OldCount int        `json:"oldCount"`
	NewStart int        `json:"newStart"`
	NewCount int        `json:"newCount"`
	Lines    []DiffLine `json:"lines"`
}

// FileDiff represents a file diff with chunks and stats
type FileDiff struct {
	Path      string      `json:"path"`
	OldPath   string      `json:"oldPath,omitempty"`
	Status    string      `json:"status"` // modified, added, deleted
	Additions int         `json:"additions"`
	Deletions int         `json:"deletions"`
	Chunks    []DiffChunk `json:"chunks"`
	IsStaged  bool        `json:"isStaged,omitempty"`
}

// TerminalLine represents a line of output or input in the terminal emulator
type TerminalLine struct {
	ID        string `json:"id"`
	Type      string `json:"type"` // input, output, error, system
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

// WorkspaceFile represents a node in the project file explorer tree
type WorkspaceFile struct {
	Name     string          `json:"name"`
	Path     string          `json:"path"`
	Type     string          `json:"type"` // file, directory
	Size     int64           `json:"size,omitempty"`
	Children []WorkspaceFile `json:"children,omitempty"`
}

// ServerEnvironment represents a connected or connectable runtime environment
type ServerEnvironment struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"` // local, tailscale, ssh, relay
	Host        string `json:"host"`
	Port        int    `json:"port"`
	IsConnected bool   `json:"isConnected"`
	LatencyMs   int    `json:"latencyMs,omitempty"`
	Version     string `json:"version,omitempty"`
}

// ServerConfig holds runtime server settings
type ServerConfig struct {
	Port         int    `json:"port"`
	Host         string `json:"host"`
	Cwd          string `json:"cwd"`
	AuthToken    string `json:"authToken,omitempty"`
	Version      string `json:"version"`
	Platform     string `json:"platform"`
	StartedAt    time.Time `json:"startedAt"`
}

// WSMessage represents a generic message envelope over the WebSocket connection
type WSMessage struct {
	Type    string         `json:"type"`              // e.g. client_hello, server_hello, turn.start, turn.chunk
	ID      string         `json:"id,omitempty"`      // message or request ID
	Method  string         `json:"method,omitempty"`  // RPC method name (for orchestration / WS_METHODS)
	Payload map[string]any `json:"payload,omitempty"` // arbitrary payload
	Turn    *Turn          `json:"turn,omitempty"`
	Message *Message       `json:"message,omitempty"`
	Tool    *ToolCall      `json:"tool,omitempty"`
	Error   string         `json:"error,omitempty"`
}
