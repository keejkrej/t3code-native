package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/pingdotgg/t3code/server/internal/config"
	"github.com/pingdotgg/t3code/server/internal/git"
	"github.com/pingdotgg/t3code/server/internal/orchestrator"
	"github.com/pingdotgg/t3code/server/internal/terminal"
	"github.com/pingdotgg/t3code/server/internal/workspace"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024 * 1024,
	WriteBufferSize: 1024 * 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow Electron, Vite dev server, and localhost origins
		return true
	},
}

// Hub manages active WebSocket clients and dispatches server-wide broadcasts
type Hub struct {
	mu           sync.RWMutex
	clients      map[*Client]bool
	broadcast    chan []byte
	register     chan *Client
	unregister   chan *Client

	Config       *config.AppConfig
	Engine       *orchestrator.OrchestratorEngine
	GitService   *git.Service
	TerminalMgr  *terminal.Manager
	WorkspaceSvc *workspace.Service
}

func NewHub(
	cfg *config.AppConfig,
	engine *orchestrator.OrchestratorEngine,
	gitSvc *git.Service,
	termMgr *terminal.Manager,
	wsSvc *workspace.Service,
) *Hub {
	return &Hub{
		clients:      make(map[*Client]bool),
		broadcast:    make(chan []byte, 256),
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		Config:       cfg,
		Engine:       engine,
		GitService:   gitSvc,
		TerminalMgr:  termMgr,
		WorkspaceSvc: wsSvc,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[WS] Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[WS] Client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastJSON broadcasts a message to all connected clients
func (h *Hub) BroadcastJSON(v any) {
	data, err := json.Marshal(v)
	if err != nil {
		return
	}
	h.broadcast <- data
}

func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

// ServeWS upgrades the HTTP request to WebSocket and runs pumps
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Upgrade failed: %v", err)
		return
	}

	client := NewClient(h, conn)
	h.register <- client

	go client.WritePump()
	go client.ReadPump()
}
