package workspace

import (
	"os"
	"path/filepath"
	"testing"
)

func TestWorkspaceService(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "t3workspace-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	svc := NewService()

	// Write files
	err = svc.WriteFileContent(tempDir, "src/index.ts", "console.log('hello world');\n")
	if err != nil {
		t.Fatalf("failed to write file: %v", err)
	}

	err = svc.WriteFileContent(tempDir, "README.md", "# Test Project\n")
	if err != nil {
		t.Fatalf("failed to write README: %v", err)
	}

	// Read file
	content, err := svc.ReadFileContent(tempDir, "src/index.ts")
	if err != nil {
		t.Fatalf("failed to read file: %v", err)
	}
	if content != "console.log('hello world');\n" {
		t.Errorf("unexpected content: %s", content)
	}

	// Create ignored directory
	nodeModulesDir := filepath.Join(tempDir, "node_modules", "somepkg")
	os.MkdirAll(nodeModulesDir, 0755)
	os.WriteFile(filepath.Join(nodeModulesDir, "package.json"), []byte("{}"), 0644)

	// Get tree
	tree, err := svc.GetFileTree(tempDir, 4)
	if err != nil {
		t.Fatalf("failed to get file tree: %v", err)
	}

	// Ensure node_modules was ignored
	for _, f := range tree {
		if f.Name == "node_modules" {
			t.Errorf("node_modules was not ignored")
		}
	}

	if len(tree) < 2 {
		t.Errorf("expected at least 2 entries, got %d", len(tree))
	}
}
