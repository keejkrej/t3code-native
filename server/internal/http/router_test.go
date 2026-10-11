package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/pingdotgg/t3code/server/internal/config"
	"github.com/pingdotgg/t3code/server/internal/git"
	"github.com/pingdotgg/t3code/server/internal/orchestrator"
	"github.com/pingdotgg/t3code/server/internal/terminal"
	"github.com/pingdotgg/t3code/server/internal/workspace"
	"github.com/pingdotgg/t3code/server/internal/ws"
)

func setupTestServer(t *testing.T) (*Router, string) {
	tempDir, err := os.MkdirTemp("", "t3router-test-*")
	if err != nil {
		t.Fatal(err)
	}

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
	hub := ws.NewHub(cfg, engine, gitSvc, termMgr, workspaceSvc)
	router := NewRouter(cfg, hub, engine, gitSvc, termMgr, workspaceSvc)

	return router, tempDir
}

func TestHealthEndpoint(t *testing.T) {
	router, tempDir := setupTestServer(t)
	defer os.RemoveAll(tempDir)

	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var data map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &data); err != nil {
		t.Fatalf("failed to decode health response: %v", err)
	}

	if data["status"] != "healthy" {
		t.Errorf("expected status healthy, got %v", data["status"])
	}
}

func TestProjectsEndpoint(t *testing.T) {
	router, tempDir := setupTestServer(t)
	defer os.RemoveAll(tempDir)

	req := httptest.NewRequest("GET", "/api/projects", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestProvidersEndpoint(t *testing.T) {
	router, tempDir := setupTestServer(t)
	defer os.RemoveAll(tempDir)

	req := httptest.NewRequest("GET", "/api/providers", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestTerminalExecEndpoint(t *testing.T) {
	router, tempDir := setupTestServer(t)
	defer os.RemoveAll(tempDir)

	payload := []byte(`{"command":"echo 'test terminal router'"}`)
	req := httptest.NewRequest("POST", "/api/terminal/exec", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}
