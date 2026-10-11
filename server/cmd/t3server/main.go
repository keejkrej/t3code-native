package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/pingdotgg/t3code/server/internal/config"
	"github.com/pingdotgg/t3code/server/internal/git"
	serverHttp "github.com/pingdotgg/t3code/server/internal/http"
	"github.com/pingdotgg/t3code/server/internal/orchestrator"
	"github.com/pingdotgg/t3code/server/internal/terminal"
	"github.com/pingdotgg/t3code/server/internal/workspace"
	"github.com/pingdotgg/t3code/server/internal/ws"
)

func main() {
	// Handle quick subcommands before flag parsing
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "version", "--version", "-v":
			fmt.Printf("T3 Code Server v%s\n", config.CurrentVersion)
			return
		case "health":
			resp, err := http.Get(fmt.Sprintf("http://localhost:%d/health", config.DefaultPort))
			if err != nil || resp.StatusCode != http.StatusOK {
				fmt.Printf("T3 Code Server is not responding on port %d\n", config.DefaultPort)
				os.Exit(1)
			}
			fmt.Printf("T3 Code Server is healthy on port %d\n", config.DefaultPort)
			return
		}
	}

	cfg := config.ParseFlags()

	banner := `
===========================================================
  _______ ____   ____          _        ____       
 |__   __|___ \ / ___|___   __| | ___  / ___| ___  
    | |    __) | |   / _ \ / _` + "`" + ` |/ _ \| |  _ / _ \ 
    | |   / __/| |__| (_) | (_| |  __/| |_| | (_) |
    |_|  |_____|\____\___/ \__,_|\___| \____|\___/ 
                                                    
  T3 Code Go Server Orchestrator v%s (%s)
===========================================================
`
	fmt.Printf(banner, cfg.Version, cfg.Platform)
	log.Printf("[Server] Workspace root : %s", cfg.Cwd)
	log.Printf("[Server] HTTP endpoint  : http://%s:%d", cfg.Host, cfg.Port)
	log.Printf("[Server] WS endpoint    : ws://%s:%d/ws", cfg.Host, cfg.Port)

	// Initialize core services
	gitSvc := git.NewService()
	workspaceSvc := workspace.NewService()
	termMgr := terminal.NewManager(cfg.Cwd)
	engine := orchestrator.NewOrchestratorEngine(cfg.Cwd)
	hub := ws.NewHub(cfg, engine, gitSvc, termMgr, workspaceSvc)

	// Run WebSocket hub event loop
	go hub.Run()

	// Initialize HTTP & WebSocket router
	router := serverHttp.NewRouter(cfg, hub, engine, gitSvc, termMgr, workspaceSvc)

	serverAddr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server shutdown channel
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("[Server] Ready to pair with React Native desktop client!")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Server] Listen error: %v", err)
		}
	}()

	<-stopChan
	log.Println("[Server] Gracefully shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("[Server] Forced shutdown: %v", err)
	}
	log.Println("[Server] Server stopped.")
}
