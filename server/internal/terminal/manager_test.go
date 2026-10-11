package terminal

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"
)

func TestTerminalManager(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "t3term-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	mgr := NewManager(tempDir)

	history := mgr.GetHistory()
	if len(history) < 2 {
		t.Fatalf("expected initial system history lines, got %d", len(history))
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	output, err := mgr.ExecuteCommand(ctx, "echo 'hello terminal test'", tempDir)
	if err != nil {
		t.Fatalf("failed to execute command: %v", err)
	}

	if !strings.Contains(output, "hello terminal test") {
		t.Errorf("output did not contain expected text, got: %s", output)
	}

	updatedHistory := mgr.GetHistory()
	found := false
	for _, line := range updatedHistory {
		if strings.Contains(line.Text, "hello terminal test") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("command output was not recorded in history")
	}

	mgr.ClearHistory()
	if len(mgr.GetHistory()) != 0 {
		t.Errorf("expected empty history after clear")
	}
}
