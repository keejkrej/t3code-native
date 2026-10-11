package ws

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/pingdotgg/t3code/server/internal/models"
	"github.com/pingdotgg/t3code/server/internal/orchestrator"
)

// HandleMessage parses and routes inbound WebSocket commands
func (h *Hub) HandleMessage(client *Client, msg *models.WSMessage) {
	log.Printf("[WS] Received message: type=%s, method=%s", msg.Type, msg.Method)

	// Route based on Type or Method (supporting both native desktop client and contracts RPC)
	action := msg.Type
	if action == "" {
		action = msg.Method
	}

	switch action {
	case "client_hello", "server.probe", "server.getConfig":
		h.handleClientHello(client, msg)

	case "turn.start", "message.send", "orchestration.dispatchCommand":
		h.handleTurnStart(client, msg)

	case "turn.cancel", "orchestration.stopWorkflow":
		h.handleTurnCancel(client, msg)

	case "thread.create", "orchestration.launchThread":
		h.handleThreadCreate(client, msg)

	case "thread.delete":
		h.handleThreadDelete(client, msg)

	case "terminal.exec", "terminal.write":
		h.handleTerminalExec(client, msg)

	case "diffs.get", "vcs.status", "review.getDiffPreview":
		h.handleDiffsGet(client, msg)

	case "diffs.stage":
		h.handleDiffsStage(client, msg)

	case "diffs.revert":
		h.handleDiffsRevert(client, msg)

	case "filesystem.browse", "projects.listEntries":
		h.handleFilesystemBrowse(client, msg)

	case "filesystem.read", "projects.readFile":
		h.handleFilesystemRead(client, msg)

	case "projects.list":
		h.handleProjectsList(client, msg)

	case "ping":
		client.SendJSON(map[string]any{"type": "pong", "timestamp": time.Now().UnixMilli()})

	default:
		log.Printf("[WS] Unhandled message type: %s", action)
		client.SendJSON(map[string]any{
			"type":    "ack",
			"action":  action,
			"status":  "received",
			"payload": msg.Payload,
		})
	}
}

func (h *Hub) handleClientHello(client *Client, msg *models.WSMessage) {
	projects := h.Engine.GetProjects()
	var activeProj *models.Project
	if len(projects) > 0 {
		activeProj = projects[0]
	}

	threads := h.Engine.ListThreads("")
	var activeThread *models.Thread
	if len(threads) > 0 {
		activeThread = threads[0]
	}

	// Prepare initial messages and turns maps
	messagesMap := make(map[string][]*models.Message)
	turnsMap := make(map[string][]*models.Turn)
	for _, t := range threads {
		messagesMap[t.ID] = h.Engine.GetMessages(t.ID)
		turnsMap[t.ID] = h.Engine.GetTurns(t.ID)
	}

	diffs, _ := h.GitService.GetDiffs(h.Config.Cwd)
	tree, _ := h.WorkspaceSvc.GetFileTree(h.Config.Cwd, 3)
	terminalHistory := h.TerminalMgr.GetHistory()
	providers := orchestrator.GetDefaultProviders()

	env := models.ServerEnvironment{
		ID:          "env-local",
		Name:        "Local Workstation",
		Type:        "local",
		Host:        h.Config.Host,
		Port:        h.Config.Port,
		IsConnected: true,
		LatencyMs:   2,
		Version:     h.Config.Version,
	}

	client.SendJSON(map[string]any{
		"type":           "server_hello",
		"version":        h.Config.Version,
		"platform":       h.Config.Platform,
		"projects":       projects,
		"activeProject":  activeProj,
		"threads":        threads,
		"activeThread":   activeThread,
		"messages":       messagesMap,
		"turns":          turnsMap,
		"providers":      providers,
		"diffs":          diffs,
		"terminalLines":  terminalHistory,
		"workspaceFiles": tree,
		"environment":    env,
	})
}

func (h *Hub) handleTurnStart(client *Client, msg *models.WSMessage) {
	threadID, _ := msg.Payload["threadId"].(string)
	prompt, _ := msg.Payload["content"].(string)
	if prompt == "" {
		prompt, _ = msg.Payload["prompt"].(string)
	}
	providerStr, _ := msg.Payload["provider"].(string)
	model, _ := msg.Payload["model"].(string)

	if threadID == "" || prompt == "" {
		client.SendJSON(map[string]any{
			"type":  "error",
			"error": "Missing threadId or prompt",
		})
		return
	}

	var chips []models.ContextChip
	if chipsRaw, ok := msg.Payload["contextChips"].([]any); ok {
		for _, cr := range chipsRaw {
			if cm, ok := cr.(map[string]any); ok {
				chips = append(chips, models.ContextChip{
					ID:    fmt.Sprintf("%v", cm["id"]),
					Label: fmt.Sprintf("%v", cm["label"]),
					Type:  fmt.Sprintf("%v", cm["type"]),
					Value: fmt.Sprintf("%v", cm["value"]),
				})
			}
		}
	}

	provider := models.ProviderId(providerStr)
	if provider == "" {
		provider = models.ProviderAntigravity
	}

	// Add User Message to engine
	userMsg := h.Engine.AddMessage(threadID, "user", prompt, chips)

	// Broadcast user message to all clients
	h.BroadcastJSON(map[string]any{
		"type":     "message.created",
		"threadId": threadID,
		"message":  userMsg,
	})

	// Run turn execution asynchronously
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
		defer cancel()

		_, _, err := h.Engine.StartTurn(
			ctx,
			threadID,
			prompt,
			chips,
			provider,
			model,
			func(eventType string, data any) {
				// Broadcast event to client
				payload := map[string]any{
					"type":     eventType,
					"threadId": threadID,
				}
				if m, ok := data.(map[string]any); ok {
					for k, v := range m {
						payload[k] = v
					}
				} else {
					payload["data"] = data
				}
				h.BroadcastJSON(payload)
			},
		)

		if err != nil {
			h.BroadcastJSON(map[string]any{
				"type":     "turn.failed",
				"threadId": threadID,
				"error":    err.Error(),
			})
		}
	}()
}

func (h *Hub) handleTurnCancel(client *Client, msg *models.WSMessage) {
	threadID, _ := msg.Payload["threadId"].(string)
	if threadID != "" {
		h.Engine.CancelTurn(threadID)
		h.BroadcastJSON(map[string]any{
			"type":     "turn.cancelled",
			"threadId": threadID,
		})
	}
}

func (h *Hub) handleThreadCreate(client *Client, msg *models.WSMessage) {
	projectID, _ := msg.Payload["projectId"].(string)
	title, _ := msg.Payload["title"].(string)
	providerStr, _ := msg.Payload["provider"].(string)
	model, _ := msg.Payload["model"].(string)

	thread, err := h.Engine.CreateThread(projectID, title, models.ProviderId(providerStr), model)
	if err != nil {
		client.SendJSON(map[string]any{"type": "error", "error": err.Error()})
		return
	}

	h.BroadcastJSON(map[string]any{
		"type":   "thread.created",
		"thread": thread,
	})
}

func (h *Hub) handleThreadDelete(client *Client, msg *models.WSMessage) {
	threadID, _ := msg.Payload["threadId"].(string)
	if threadID == "" {
		return
	}

	if err := h.Engine.DeleteThread(threadID); err != nil {
		client.SendJSON(map[string]any{"type": "error", "error": err.Error()})
		return
	}

	h.BroadcastJSON(map[string]any{
		"type":     "thread.deleted",
		"threadId": threadID,
	})
}

func (h *Hub) handleTerminalExec(client *Client, msg *models.WSMessage) {
	cmd, _ := msg.Payload["command"].(string)
	if cmd == "" {
		cmd, _ = msg.Payload["text"].(string)
	}
	if cmd == "" {
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		out, _ := h.TerminalMgr.ExecuteCommand(ctx, cmd, h.Config.Cwd)
		h.BroadcastJSON(map[string]any{
			"type": "terminal.output",
			"line": models.TerminalLine{
				ID:        fmt.Sprintf("term-%d", time.Now().UnixNano()),
				Type:      "output",
				Text:      out,
				Timestamp: time.Now().UnixMilli(),
			},
		})
	}()
}

func (h *Hub) handleDiffsGet(client *Client, msg *models.WSMessage) {
	diffs, err := h.GitService.GetDiffs(h.Config.Cwd)
	if err != nil {
		client.SendJSON(map[string]any{"type": "error", "error": err.Error()})
		return
	}
	client.SendJSON(map[string]any{
		"type":  "diffs.result",
		"diffs": diffs,
	})
}

func (h *Hub) handleDiffsStage(client *Client, msg *models.WSMessage) {
	filePath, _ := msg.Payload["path"].(string)
	if filePath == "" {
		return
	}

	_ = h.GitService.StageFile(h.Config.Cwd, filePath)
	diffs, _ := h.GitService.GetDiffs(h.Config.Cwd)
	h.BroadcastJSON(map[string]any{
		"type":  "diffs.updated",
		"diffs": diffs,
	})
}

func (h *Hub) handleDiffsRevert(client *Client, msg *models.WSMessage) {
	filePath, _ := msg.Payload["path"].(string)
	if filePath == "" {
		return
	}

	_ = h.GitService.RevertFile(h.Config.Cwd, filePath)
	diffs, _ := h.GitService.GetDiffs(h.Config.Cwd)
	h.BroadcastJSON(map[string]any{
		"type":  "diffs.updated",
		"diffs": diffs,
	})
}

func (h *Hub) handleFilesystemBrowse(client *Client, msg *models.WSMessage) {
	tree, err := h.WorkspaceSvc.GetFileTree(h.Config.Cwd, 4)
	if err != nil {
		client.SendJSON(map[string]any{"type": "error", "error": err.Error()})
		return
	}
	client.SendJSON(map[string]any{
		"type":  "filesystem.browse_result",
		"files": tree,
	})
}

func (h *Hub) handleFilesystemRead(client *Client, msg *models.WSMessage) {
	path, _ := msg.Payload["path"].(string)
	content, err := h.WorkspaceSvc.ReadFileContent(h.Config.Cwd, path)
	if err != nil {
		client.SendJSON(map[string]any{"type": "error", "error": err.Error()})
		return
	}
	client.SendJSON(map[string]any{
		"type":    "filesystem.read_result",
		"path":    path,
		"content": content,
	})
}

func (h *Hub) handleProjectsList(client *Client, msg *models.WSMessage) {
	projects := h.Engine.GetProjects()
	client.SendJSON(map[string]any{
		"type":     "projects.result",
		"projects": projects,
	})
}
