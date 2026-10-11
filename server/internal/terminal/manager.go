package terminal

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"sync"
	"time"

	"github.com/pingdotgg/t3code/server/internal/models"
)

// Manager manages terminal sessions and command executions
type Manager struct {
	mu      sync.RWMutex
	history []models.TerminalLine
	cwd     string
}

func NewManager(defaultCwd string) *Manager {
	mgr := &Manager{
		cwd:     defaultCwd,
		history: make([]models.TerminalLine, 0),
	}
	mgr.AddLine("system", "T3 Code Go Server Terminal Engine v1.0.0 initialized")
	mgr.AddLine("system", fmt.Sprintf("Environment root: %s", defaultCwd))
	return mgr
}

func (m *Manager) AddLine(lineType, text string) models.TerminalLine {
	m.mu.Lock()
	defer m.mu.Unlock()

	line := models.TerminalLine{
		ID:        fmt.Sprintf("term-%d", time.Now().UnixNano()),
		Type:      lineType,
		Text:      text,
		Timestamp: time.Now().UnixMilli(),
	}
	m.history = append(m.history, line)
	if len(m.history) > 1000 {
		m.history = m.history[len(m.history)-1000:]
	}
	return line
}

func (m *Manager) GetHistory() []models.TerminalLine {
	m.mu.RLock()
	defer m.mu.RUnlock()
	res := make([]models.TerminalLine, len(m.history))
	copy(res, m.history)
	return res
}

func (m *Manager) ClearHistory() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.history = make([]models.TerminalLine, 0)
}

// ExecuteCommand executes a shell command in cwd with timeout and records output
func (m *Manager) ExecuteCommand(ctx context.Context, commandLine string, customCwd string) (string, error) {
	targetCwd := m.cwd
	if customCwd != "" {
		targetCwd = customCwd
	}

	m.AddLine("input", commandLine)

	cmd := exec.CommandContext(ctx, "bash", "-c", commandLine)
	cmd.Dir = targetCwd

	var outBuf, errBuf bytes.Buffer
	cmd.Stdout = &outBuf
	cmd.Stderr = &errBuf

	err := cmd.Run()
	output := outBuf.String()
	errOutput := errBuf.String()

	combined := output
	if errOutput != "" {
		if combined != "" {
			combined += "\n" + errOutput
		} else {
			combined = errOutput
		}
	}

	if combined != "" {
		if err != nil {
			m.AddLine("error", combined)
		} else {
			m.AddLine("output", combined)
		}
	} else if err != nil {
		m.AddLine("error", fmt.Sprintf("Command exited with error: %v", err))
	}

	return combined, err
}
