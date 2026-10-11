package ws

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pingdotgg/t3code/server/internal/config"
	"github.com/pingdotgg/t3code/server/internal/git"
	"github.com/pingdotgg/t3code/server/internal/orchestrator"
	"github.com/pingdotgg/t3code/server/internal/terminal"
	"github.com/pingdotgg/t3code/server/internal/workspace"
)

func TestWebSocketHubLifecycle(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "t3wshub-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	cfg := &config.AppConfig{
		Port:      3773,
		Host:      "127.0.0.1",
		Cwd:       tempDir,
		Version:   "1.0.0",
		Platform:  "linux/amd64",
		StartedAt: time.Now(),
	}

	gitSvc := git.NewService()
	workspaceSvc := workspace.NewService()
	termMgr := terminal.NewManager(tempDir)
	engine := orchestrator.NewOrchestratorEngine(tempDir)
	hub := NewHub(cfg, engine, gitSvc, termMgr, workspaceSvc)
	go hub.Run()

	server := httptest.NewServer(http.HandlerFunc(hub.ServeWS))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	dialer := websocket.DefaultDialer
	conn, _, err := dialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("failed to dial websocket: %v", err)
	}
	defer conn.Close()

	// Send client_hello
	helloMsg := map[string]any{
		"type":    "client_hello",
		"client":  "t3code-native-desktop",
		"version": "1.0.0",
	}
	if err := conn.WriteJSON(helloMsg); err != nil {
		t.Fatalf("failed to send client_hello: %v", err)
	}

	// Read server_hello
	var resp map[string]any
	err = conn.ReadJSON(&resp)
	if err != nil {
		t.Fatalf("failed to read response: %v", err)
	}

	if resp["type"] != "server_hello" {
		t.Errorf("expected server_hello, got %v", resp["type"])
	}

	if resp["projects"] == nil {
		t.Errorf("expected projects in server_hello")
	}

	if resp["providers"] == nil {
		t.Errorf("expected providers in server_hello")
	}

	// Send turn.start
	turnStartMsg := map[string]any{
		"type": "turn.start",
		"payload": map[string]any{
			"threadId": "thread-default",
			"content":  "Verify workspace and inspect files",
			"provider": "antigravity",
			"model":    "gemini-3.8-flash-high",
		},
	}
	if err := conn.WriteJSON(turnStartMsg); err != nil {
		t.Fatalf("failed to send turn.start: %v", err)
	}

	// Read messages until turn.completed
	receivedCompleted := false
	conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	for {
		var event map[string]any
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}
		json.Unmarshal(raw, &event)
		eventType, _ := event["type"].(string)
		if eventType == "turn.completed" {
			receivedCompleted = true
			break
		}
	}

	if !receivedCompleted {
		t.Errorf("expected to receive turn.completed event over WebSocket")
	}
}
