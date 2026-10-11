package orchestrator

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/pingdotgg/t3code/server/internal/models"
)

func TestOrchestratorEngine(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "t3engine-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	engine := NewOrchestratorEngine(tempDir)

	// Projects
	projects := engine.GetProjects()
	if len(projects) == 0 {
		t.Fatalf("expected at least 1 default project")
	}

	// Create Thread
	thread, err := engine.CreateThread(projects[0].ID, "Test Thread", models.ProviderAntigravity, "gemini-3.8-flash-high")
	if err != nil {
		t.Fatalf("failed to create thread: %v", err)
	}
	if thread.Title != "Test Thread" {
		t.Errorf("unexpected thread title: %s", thread.Title)
	}

	// List Threads
	threads := engine.ListThreads(projects[0].ID)
	if len(threads) < 1 {
		t.Fatalf("expected threads in project")
	}

	// Add User Message
	userMsg := engine.AddMessage(thread.ID, "user", "Run a test command", nil)
	if userMsg.Content != "Run a test command" {
		t.Errorf("unexpected message content: %s", userMsg.Content)
	}

	// Start Turn
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var eventsReceived []string
	turn, assistantMsg, err := engine.StartTurn(
		ctx,
		thread.ID,
		"Run a test command",
		nil,
		models.ProviderAntigravity,
		"gemini-3.8-flash-high",
		func(eventType string, data any) {
			eventsReceived = append(eventsReceived, eventType)
		},
	)

	if err != nil {
		t.Fatalf("StartTurn failed: %v", err)
	}

	if turn.Status != "completed" {
		t.Errorf("expected completed turn status, got %s", turn.Status)
	}

	if len(turn.ToolCalls) == 0 {
		t.Errorf("expected at least 1 tool call executed")
	}

	if turn.Checkpoint == nil {
		t.Errorf("expected checkpoint generated")
	}

	if assistantMsg == nil || assistantMsg.Role != "assistant" {
		t.Errorf("expected valid assistant message")
	}

	if len(eventsReceived) == 0 {
		t.Errorf("expected events to be emitted during turn")
	}

	// Delete Thread
	err = engine.DeleteThread(thread.ID)
	if err != nil {
		t.Fatalf("failed to delete thread: %v", err)
	}

	_, err = engine.GetThread(thread.ID)
	if err == nil {
		t.Errorf("expected error getting deleted thread")
	}
}
