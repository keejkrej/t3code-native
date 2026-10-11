package workspace

import (
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/pingdotgg/t3code/server/internal/models"
)

// Service provides workspace filesystem operations
type Service struct{}

func NewService() *Service {
	return &Service{}
}

// Ignored directory names for tree scanning
var ignoredDirs = map[string]bool{
	".git":         true,
	"node_modules": true,
	"dist":         true,
	"dist-electron": true,
	".cache":       true,
	".t3":          true,
	".idea":        true,
	".vscode":      true,
	"target":       true,
	"build":        true,
	"out":          true,
}

// GetFileTree scans the workspace root and returns a nested WorkspaceFile hierarchy
func (s *Service) GetFileTree(rootPath string, maxDepth int) ([]models.WorkspaceFile, error) {
	if maxDepth <= 0 {
		maxDepth = 5
	}
	return s.scanDir(rootPath, rootPath, 0, maxDepth)
}

func (s *Service) scanDir(basePath, currentPath string, depth, maxDepth int) ([]models.WorkspaceFile, error) {
	if depth > maxDepth {
		return nil, nil
	}

	entries, err := os.ReadDir(currentPath)
	if err != nil {
		return nil, err
	}

	var results []models.WorkspaceFile

	for _, entry := range entries {
		name := entry.Name()
		if strings.HasPrefix(name, ".") && name != ".gitignore" && name != ".env.example" {
			// Skip hidden files unless standard config
			continue
		}
		if entry.IsDir() && ignoredDirs[name] {
			continue
		}

		fullPath := filepath.Join(currentPath, name)
		relPath, _ := filepath.Rel(basePath, fullPath)
		relPath = filepath.ToSlash(relPath)

		if entry.IsDir() {
			children, _ := s.scanDir(basePath, fullPath, depth+1, maxDepth)
			results = append(results, models.WorkspaceFile{
				Name:     name,
				Path:     relPath,
				Type:     "directory",
				Children: children,
			})
		} else {
			info, _ := entry.Info()
			var size int64 = 0
			if info != nil {
				size = info.Size()
			}
			results = append(results, models.WorkspaceFile{
				Name: name,
				Path: relPath,
				Type: "file",
				Size: size,
			})
		}
	}

	// Sort directories first, then alphabetically
	sort.Slice(results, func(i, j int) bool {
		if results[i].Type != results[j].Type {
			return results[i].Type == "directory"
		}
		return results[i].Name < results[j].Name
	})

	return results, nil
}

// ReadFileContent reads file content within the workspace
func (s *Service) ReadFileContent(basePath, relPath string) (string, error) {
	fullPath := filepath.Join(basePath, relPath)
	content, err := os.ReadFile(fullPath)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

// WriteFileContent writes file content within the workspace
func (s *Service) WriteFileContent(basePath, relPath, content string) error {
	fullPath := filepath.Join(basePath, relPath)
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return err
	}
	return os.WriteFile(fullPath, []byte(content), 0644)
}
