package orchestrator

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/pingdotgg/t3code/server/internal/models"
)

// ToolExecutor executes agent tool calls against the project workspace
type ToolExecutor struct {
	workspaceDir string
}

func NewToolExecutor(workspaceDir string) *ToolExecutor {
	return &ToolExecutor{
		workspaceDir: workspaceDir,
	}
}

// Execute runs the named tool with parameters and returns a ToolCall result
func (te *ToolExecutor) Execute(ctx context.Context, name string, summary string, params map[string]any) models.ToolCall {
	start := time.Now()
	call := models.ToolCall{
		ID:         fmt.Sprintf("tool-%d", start.UnixNano()),
		Name:       name,
		Summary:    summary,
		Parameters: params,
		Status:     "running",
		Timestamp:  start.Format("15:04"),
	}

	var result any
	var err error

	switch name {
	case "run_command":
		result, err = te.execRunCommand(ctx, params)
	case "view_file":
		result, err = te.execViewFile(params)
	case "client_create_file":
		result, err = te.execCreateFile(params)
	case "client_edit_file":
		result, err = te.execEditFile(params)
	case "grep_search":
		result, err = te.execGrepSearch(params)
	case "list_dir":
		result, err = te.execListDir(params)
	default:
		err = fmt.Errorf("unknown tool: %s", name)
	}

	duration := time.Since(start).Milliseconds()
	call.DurationMs = duration

	if err != nil {
		call.Status = "failed"
		call.Result = fmt.Sprintf("Error: %v", err)
	} else {
		call.Status = "success"
		call.Result = result
	}

	return call
}

func (te *ToolExecutor) execRunCommand(ctx context.Context, params map[string]any) (string, error) {
	cmdLine, _ := params["CommandLine"].(string)
	if cmdLine == "" {
		cmdLine, _ = params["command"].(string)
	}
	if cmdLine == "" {
		return "", fmt.Errorf("missing CommandLine parameter")
	}

	cmdCwd := te.workspaceDir
	if c, ok := params["Cwd"].(string); ok && c != "" {
		cmdCwd = c
	}

	execCmd := exec.CommandContext(ctx, "bash", "-c", cmdLine)
	execCmd.Dir = cmdCwd

	var stdout, stderr bytes.Buffer
	execCmd.Stdout = &stdout
	execCmd.Stderr = &stderr

	err := execCmd.Run()
	output := stdout.String()
	if stderr.Len() > 0 {
		if output != "" {
			output += "\n"
		}
		output += stderr.String()
	}

	// Limit length to avoid overwhelming response
	if len(output) > 20000 {
		output = output[:20000] + "\n...[truncated output]"
	}

	if err != nil && output == "" {
		return "", fmt.Errorf("command execution failed: %v", err)
	}

	return output, nil
}

func (te *ToolExecutor) execViewFile(params map[string]any) (string, error) {
	path, _ := params["absolute_path"].(string)
	if path == "" {
		path, _ = params["AbsolutePath"].(string)
	}
	if path == "" {
		path, _ = params["path"].(string)
	}
	if path == "" {
		return "", fmt.Errorf("missing file path parameter")
	}

	if !filepath.IsAbs(path) {
		path = filepath.Join(te.workspaceDir, path)
	}

	file, err := os.Open(path)
	if err != nil {
		return "", fmt.Errorf("could not open file: %w", err)
	}
	defer file.Close()

	var startLine, endLine int
	if s, ok := params["start_line"].(float64); ok {
		startLine = int(s)
	} else if s, ok := params["StartLine"].(float64); ok {
		startLine = int(s)
	}

	if e, ok := params["end_line"].(float64); ok {
		endLine = int(e)
	} else if e, ok := params["EndLine"].(float64); ok {
		endLine = int(e)
	}

	scanner := bufio.NewScanner(file)
	var lines []string
	lineNum := 1

	for scanner.Scan() {
		text := scanner.Text()
		if startLine > 0 && lineNum < startLine {
			lineNum++
			continue
		}
		if endLine > 0 && lineNum > endLine {
			break
		}
		lines = append(lines, fmt.Sprintf("%4d | %s", lineNum, text))
		lineNum++
	}

	return strings.Join(lines, "\n"), scanner.Err()
}

func (te *ToolExecutor) execCreateFile(params map[string]any) (string, error) {
	targetFile, _ := params["target_file"].(string)
	if targetFile == "" {
		targetFile, _ = params["path"].(string)
	}
	if targetFile == "" {
		return "", fmt.Errorf("missing target_file parameter")
	}

	content, _ := params["code_content"].(string)
	if content == "" {
		content, _ = params["content"].(string)
	}

	if !filepath.IsAbs(targetFile) {
		targetFile = filepath.Join(te.workspaceDir, targetFile)
	}

	if err := os.MkdirAll(filepath.Dir(targetFile), 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	if err := os.WriteFile(targetFile, []byte(content), 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	lineCount := len(strings.Split(content, "\n"))
	return fmt.Sprintf("Successfully created %s (%d lines)", filepath.Base(targetFile), lineCount), nil
}

func (te *ToolExecutor) execEditFile(params map[string]any) (string, error) {
	return te.execCreateFile(params)
}

func (te *ToolExecutor) execGrepSearch(params map[string]any) (string, error) {
	query, _ := params["Query"].(string)
	if query == "" {
		query, _ = params["query"].(string)
	}
	if query == "" {
		return "", fmt.Errorf("missing query parameter")
	}

	searchPath := te.workspaceDir
	if p, ok := params["SearchPath"].(string); ok && p != "" {
		if filepath.IsAbs(p) {
			searchPath = p
		} else {
			searchPath = filepath.Join(te.workspaceDir, p)
		}
	}

	cmd := exec.Command("grep", "-rnI", "--exclude-dir=.git", "--exclude-dir=node_modules", query, searchPath)
	out, err := cmd.CombinedOutput()
	if err != nil && len(out) == 0 {
		return "No matches found.", nil
	}
	return string(out), nil
}

func (te *ToolExecutor) execListDir(params map[string]any) (string, error) {
	dirPath := te.workspaceDir
	if p, ok := params["DirectoryPath"].(string); ok && p != "" {
		if filepath.IsAbs(p) {
			dirPath = p
		} else {
			dirPath = filepath.Join(te.workspaceDir, p)
		}
	}

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return "", fmt.Errorf("could not read directory: %w", err)
	}

	var names []string
	for _, entry := range entries {
		suffix := ""
		if entry.IsDir() {
			suffix = "/"
		}
		names = append(names, entry.Name()+suffix)
	}

	return strings.Join(names, "\n"), nil
}
