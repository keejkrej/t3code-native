package http

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/pingdotgg/t3code/server/internal/config"
	"github.com/pingdotgg/t3code/server/internal/git"
	"github.com/pingdotgg/t3code/server/internal/orchestrator"
	"github.com/pingdotgg/t3code/server/internal/terminal"
	"github.com/pingdotgg/t3code/server/internal/workspace"
	"github.com/pingdotgg/t3code/server/internal/ws"
)

// Router builds the HTTP server handler with REST routes and WebSocket mount
type Router struct {
	cfg          *config.AppConfig
	hub          *ws.Hub
	engine       *orchestrator.OrchestratorEngine
	gitSvc       *git.Service
	terminalMgr  *terminal.Manager
	workspaceSvc *workspace.Service
	mux          *http.ServeMux
}

func NewRouter(
	cfg *config.AppConfig,
	hub *ws.Hub,
	engine *orchestrator.OrchestratorEngine,
	gitSvc *git.Service,
	termMgr *terminal.Manager,
	wsSvc *workspace.Service,
) *Router {
	r := &Router{
		cfg:          cfg,
		hub:          hub,
		engine:       engine,
		gitSvc:       gitSvc,
		terminalMgr:  termMgr,
		workspaceSvc: wsSvc,
		mux:          http.NewServeMux(),
	}
	r.registerRoutes()
	return r
}

func (r *Router) registerRoutes() {
	// WebSocket endpoint
	r.mux.HandleFunc("/ws", r.hub.ServeWS)

	// Health and Status
	r.mux.HandleFunc("/health", r.handleHealth)
	r.mux.HandleFunc("/api/health", r.handleHealth)

	// Projects
	r.mux.HandleFunc("/api/projects", r.handleProjects)

	// Diffs
	r.mux.HandleFunc("/api/diffs", r.handleDiffs)

	// Files
	r.mux.HandleFunc("/api/files", r.handleFiles)
	r.mux.HandleFunc("/api/files/read", r.handleFileRead)

	// Providers
	r.mux.HandleFunc("/api/providers", r.handleProviders)

	// Terminal
	r.mux.HandleFunc("/api/terminal/history", r.handleTerminalHistory)
	r.mux.HandleFunc("/api/terminal/exec", r.handleTerminalExec)

	// Config
	r.mux.HandleFunc("/api/config", r.handleConfig)
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	// Enable CORS for React Native Web, Electron, and browser development
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

	if req.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	r.mux.ServeHTTP(w, req)
}

func (r *Router) handleHealth(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":    "healthy",
		"service":   "t3code-server",
		"version":   r.cfg.Version,
		"platform":  r.cfg.Platform,
		"uptimeSec": int(time.Since(r.cfg.StartedAt).Seconds()),
	})
}

func (r *Router) handleProjects(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if req.Method == http.MethodGet {
		projects := r.engine.GetProjects()
		json.NewEncoder(w).Encode(projects)
		return
	}

	if req.Method == http.MethodPost {
		var body struct {
			Path string `json:"path"`
		}
		if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		proj, err := r.engine.AddProject(body.Path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		json.NewEncoder(w).Encode(proj)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func (r *Router) handleDiffs(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	diffs, err := r.gitSvc.GetDiffs(r.cfg.Cwd)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(diffs)
}

func (r *Router) handleFiles(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tree, err := r.workspaceSvc.GetFileTree(r.cfg.Cwd, 4)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(tree)
}

func (r *Router) handleFileRead(w http.ResponseWriter, req *http.Request) {
	path := req.URL.Query().Get("path")
	if path == "" {
		http.Error(w, "Missing path parameter", http.StatusBadRequest)
		return
	}
	content, err := r.workspaceSvc.ReadFileContent(r.cfg.Cwd, path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"path":    path,
		"content": content,
	})
}

func (r *Router) handleProviders(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	providers := orchestrator.GetDefaultProviders()
	json.NewEncoder(w).Encode(providers)
}

func (r *Router) handleTerminalHistory(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	lines := r.terminalMgr.GetHistory()
	json.NewEncoder(w).Encode(lines)
}

func (r *Router) handleTerminalExec(w http.ResponseWriter, req *http.Request) {
	var body struct {
		Command string `json:"command"`
	}
	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(req.Context(), 30*time.Second)
	defer cancel()

	output, err := r.terminalMgr.ExecuteCommand(ctx, body.Command, r.cfg.Cwd)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"output": output,
		"error":  err != nil,
	})
}

func (r *Router) handleConfig(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(r.cfg.ToModel())
}
