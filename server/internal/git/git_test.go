package git

import (
	"testing"
)

func TestParseUnifiedDiff(t *testing.T) {
	rawDiff := `diff --git a/src/App.tsx b/src/App.tsx
index abc1234..def5678 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,5 +1,6 @@
 import React from 'react';
-const oldTitle = "Old Title";
+const newTitle = "New Title";
+console.log(newTitle);
 export default App;
diff --git a/server/main.go b/server/main.go
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/server/main.go
@@ -0,0 +1,3 @@
+package main
+func main() {}
`

	diffs := ParseUnifiedDiff(rawDiff)
	if len(diffs) != 2 {
		t.Fatalf("expected 2 file diffs, got %d", len(diffs))
	}

	appDiff := diffs[0]
	if appDiff.Path != "src/App.tsx" {
		t.Errorf("expected path src/App.tsx, got %s", appDiff.Path)
	}
	if appDiff.Status != "modified" {
		t.Errorf("expected status modified, got %s", appDiff.Status)
	}
	if appDiff.Additions != 2 {
		t.Errorf("expected 2 additions, got %d", appDiff.Additions)
	}
	if appDiff.Deletions != 1 {
		t.Errorf("expected 1 deletion, got %d", appDiff.Deletions)
	}
	if len(appDiff.Chunks) != 1 {
		t.Fatalf("expected 1 chunk, got %d", len(appDiff.Chunks))
	}

	chunk := appDiff.Chunks[0]
	if chunk.OldStart != 1 || chunk.NewStart != 1 {
		t.Errorf("unexpected chunk starts: old=%d, new=%d", chunk.OldStart, chunk.NewStart)
	}
	if len(chunk.Lines) != 5 {
		t.Errorf("expected 5 lines in chunk, got %d", len(chunk.Lines))
	}

	serverDiff := diffs[1]
	if serverDiff.Path != "server/main.go" {
		t.Errorf("expected path server/main.go, got %s", serverDiff.Path)
	}
	if serverDiff.Status != "added" {
		t.Errorf("expected status added, got %s", serverDiff.Status)
	}
	if serverDiff.Additions != 2 {
		t.Errorf("expected 2 additions, got %d", serverDiff.Additions)
	}
}

func TestEmptyDiff(t *testing.T) {
	diffs := ParseUnifiedDiff("")
	if len(diffs) != 0 {
		t.Errorf("expected 0 diffs for empty string, got %d", len(diffs))
	}
}
