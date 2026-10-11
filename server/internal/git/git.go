package git

import (
	"bufio"
	"fmt"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/pingdotgg/t3code/server/internal/models"
)

var hunkHeaderRegex = regexp.MustCompile(`^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$`)

// Service provides git operations for a workspace
type Service struct{}

func NewService() *Service {
	return &Service{}
}

// GetBranch returns the current git branch name
func (s *Service) GetBranch(cwd string) (string, error) {
	cmd := exec.Command("git", "rev-parse", "--abbrev-ref", "HEAD")
	cmd.Dir = cwd
	out, err := cmd.Output()
	if err != nil {
		return "main", nil // Default to main if not in git repo
	}
	branch := strings.TrimSpace(string(out))
	if branch == "" {
		return "main", nil
	}
	return branch, nil
}

// GetStatus returns the high-level repository status (clean, dirty, ahead, syncing)
func (s *Service) GetStatus(cwd string) (string, error) {
	cmd := exec.Command("git", "status", "--porcelain")
	cmd.Dir = cwd
	out, err := cmd.Output()
	if err != nil {
		return "clean", nil
	}
	lines := strings.TrimSpace(string(out))
	if len(lines) > 0 {
		return "dirty", nil
	}

	// Check if ahead of remote
	cmdAhead := exec.Command("git", "status", "-sb")
	cmdAhead.Dir = cwd
	if sbOut, err := cmdAhead.Output(); err == nil {
		if strings.Contains(string(sbOut), "ahead") {
			return "ahead", nil
		}
	}

	return "clean", nil
}

// GetDiffs runs git diff and returns structured FileDiff objects
func (s *Service) GetDiffs(cwd string) ([]models.FileDiff, error) {
	// First get unstaged and staged diffs
	cmd := exec.Command("git", "diff", "HEAD")
	cmd.Dir = cwd
	out, err := cmd.CombinedOutput()
	var rawDiff string
	if err == nil {
		rawDiff = string(out)
	}

	diffs := ParseUnifiedDiff(rawDiff)

	// Also check for untracked files
	untrackedCmd := exec.Command("git", "status", "--porcelain")
	untrackedCmd.Dir = cwd
	if untrackedOut, err := untrackedCmd.Output(); err == nil {
		scanner := bufio.NewScanner(strings.NewReader(string(untrackedOut)))
		existingPaths := make(map[string]bool)
		for _, d := range diffs {
			existingPaths[d.Path] = true
		}

		for scanner.Scan() {
			line := scanner.Text()
			if len(line) < 3 {
				continue
			}
			statusPrefix := line[:2]
			filePath := strings.TrimSpace(line[3:])

			if (statusPrefix == "??" || statusPrefix == "A ") && !existingPaths[filePath] {
				// Create diff representation for untracked/new file
				diffs = append(diffs, models.FileDiff{
					Path:      filePath,
					Status:    "added",
					Additions: 1,
					Deletions: 0,
					IsStaged:  statusPrefix == "A ",
					Chunks: []models.DiffChunk{
						{
							Header:   "@@ -0,0 +1,1 @@",
							OldStart: 0,
							OldCount: 0,
							NewStart: 1,
							NewCount: 1,
							Lines: []models.DiffLine{
								{
									Type:    "add",
									Content: fmt.Sprintf("[New Untracked File: %s]", filePath),
								},
							},
						},
					},
				})
			}
		}
	}

	return diffs, nil
}

// ParseUnifiedDiff parses a raw unified git diff string into structured FileDiffs
func ParseUnifiedDiff(rawDiff string) []models.FileDiff {
	var diffs []models.FileDiff
	if strings.TrimSpace(rawDiff) == "" {
		return diffs
	}

	scanner := bufio.NewScanner(strings.NewReader(rawDiff))
	var currentFile *models.FileDiff
	var currentChunk *models.DiffChunk
	oldLineNum := 0
	newLineNum := 0

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "diff --git ") {
			// Save previous chunk and file
			if currentChunk != nil && currentFile != nil {
				currentFile.Chunks = append(currentFile.Chunks, *currentChunk)
				currentChunk = nil
			}
			if currentFile != nil {
				diffs = append(diffs, *currentFile)
			}

			// Format: diff --git a/path/to/file b/path/to/file
			parts := strings.Split(line, " ")
			filePath := ""
			if len(parts) >= 4 {
				filePath = strings.TrimPrefix(parts[3], "b/")
			}

			currentFile = &models.FileDiff{
				Path:      filePath,
				Status:    "modified",
				Additions: 0,
				Deletions: 0,
				Chunks:    []models.DiffChunk{},
			}
			continue
		}

		if currentFile == nil {
			continue
		}

		if strings.HasPrefix(line, "new file mode") {
			currentFile.Status = "added"
			continue
		}
		if strings.HasPrefix(line, "deleted file mode") {
			currentFile.Status = "deleted"
			continue
		}
		if strings.HasPrefix(line, "--- ") || strings.HasPrefix(line, "+++ ") || strings.HasPrefix(line, "index ") {
			continue
		}

		// Check for hunk header @@ -a,b +c,d @@
		if match := hunkHeaderRegex.FindStringSubmatch(line); match != nil {
			if currentChunk != nil {
				currentFile.Chunks = append(currentFile.Chunks, *currentChunk)
			}

			oldStart, _ := strconv.Atoi(match[1])
			oldCount := 1
			if match[2] != "" {
				oldCount, _ = strconv.Atoi(match[2])
			}

			newStart, _ := strconv.Atoi(match[3])
			newCount := 1
			if match[4] != "" {
				newCount, _ = strconv.Atoi(match[4])
			}

			oldLineNum = oldStart
			newLineNum = newStart

			currentChunk = &models.DiffChunk{
				Header:   line,
				OldStart: oldStart,
				OldCount: oldCount,
				NewStart: newStart,
				NewCount: newCount,
				Lines:    []models.DiffLine{},
			}
			continue
		}

		if currentChunk != nil {
			if strings.HasPrefix(line, "+") {
				currentFile.Additions++
				newLineCopy := newLineNum
				currentChunk.Lines = append(currentChunk.Lines, models.DiffLine{
					Type:    "add",
					Content: line[1:],
					NewLine: &newLineCopy,
				})
				newLineNum++
			} else if strings.HasPrefix(line, "-") {
				currentFile.Deletions++
				oldLineCopy := oldLineNum
				currentChunk.Lines = append(currentChunk.Lines, models.DiffLine{
					Type:    "delete",
					Content: line[1:],
					OldLine: &oldLineCopy,
				})
				oldLineNum++
			} else if strings.HasPrefix(line, " ") {
				oldLineCopy := oldLineNum
				newLineCopy := newLineNum
				content := line
				if len(line) > 0 {
					content = line[1:]
				}
				currentChunk.Lines = append(currentChunk.Lines, models.DiffLine{
					Type:    "context",
					Content: content,
					OldLine: &oldLineCopy,
					NewLine: &newLineCopy,
				})
				oldLineNum++
				newLineNum++
			}
		}
	}

	if currentChunk != nil && currentFile != nil {
		currentFile.Chunks = append(currentFile.Chunks, *currentChunk)
	}
	if currentFile != nil {
		diffs = append(diffs, *currentFile)
	}

	return diffs
}

// StageFile stages a file using git add
func (s *Service) StageFile(cwd, filePath string) error {
	cmd := exec.Command("git", "add", filePath)
	cmd.Dir = cwd
	return cmd.Run()
}

// UnstageFile unstages a file using git restore --staged
func (s *Service) UnstageFile(cwd, filePath string) error {
	cmd := exec.Command("git", "restore", "--staged", filePath)
	cmd.Dir = cwd
	return cmd.Run()
}

// RevertFile reverts uncommitted modifications to a file
func (s *Service) RevertFile(cwd, filePath string) error {
	cmd := exec.Command("git", "checkout", "--", filePath)
	cmd.Dir = cwd
	if err := cmd.Run(); err != nil {
		// Try git restore as alternative
		cmdRestore := exec.Command("git", "restore", filePath)
		cmdRestore.Dir = cwd
		return cmdRestore.Run()
	}
	return nil
}

// GetRecentCommits returns recent git commits as Checkpoints
func (s *Service) GetRecentCommits(cwd string, limit int) ([]models.Checkpoint, error) {
	if limit <= 0 {
		limit = 10
	}
	cmd := exec.Command("git", "log", fmt.Sprintf("-n%d", limit), "--pretty=format:%H|%s|%ct")
	cmd.Dir = cwd
	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var checkpoints []models.Checkpoint
	scanner := bufio.NewScanner(strings.NewReader(string(out)))
	idx := 1
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, "|")
		if len(parts) >= 3 {
			commitHash := parts[0]
			shortHash := commitHash
			if len(shortHash) > 7 {
				shortHash = shortHash[:7]
			}
			msg := parts[1]
			timestampStr := parts[2]
			sec, _ := strconv.ParseInt(timestampStr, 10, 64)
			t := time.Unix(sec, 0).Format("15:04")

			checkpoints = append(checkpoints, models.Checkpoint{
				ID:           fmt.Sprintf("cp-%d", idx),
				TurnID:       fmt.Sprintf("turn-%d", idx),
				Message:      msg,
				CommitHash:   shortHash,
				FilesChanged: 1,
				Timestamp:    t,
			})
			idx++
		}
	}
	return checkpoints, nil
}
