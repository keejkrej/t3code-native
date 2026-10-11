package orchestrator

import (
	"os"

	"github.com/pingdotgg/t3code/server/internal/models"
)

// GetDefaultProviders returns the full catalog of providers configured for T3 Code
func GetDefaultProviders() []models.ProviderInfo {
	hasGeminiKey := os.Getenv("GEMINI_API_KEY") != "" || os.Getenv("GOOGLE_API_KEY") != ""
	hasClaudeKey := os.Getenv("ANTHROPIC_API_KEY") != ""
	hasOpenAIKey := os.Getenv("OPENAI_API_KEY") != ""
	hasGrokKey := os.Getenv("GROK_API_KEY") != ""

	geminiAuth := "needs_login"
	if hasGeminiKey {
		geminiAuth = "authenticated"
	}

	claudeAuth := "needs_login"
	if hasClaudeKey {
		claudeAuth = "authenticated"
	}

	openaiAuth := "needs_login"
	if hasOpenAIKey {
		openaiAuth = "authenticated"
	}

	grokAuth := "needs_login"
	if hasGrokKey {
		grokAuth = "authenticated"
	}

	return []models.ProviderInfo{
		{
			ID:           models.ProviderAntigravity,
			Name:         "Google Antigravity",
			Badge:        "DeepMind",
			IconColor:    "#4285F4",
			IsConfigured: true,
			AuthStatus:   geminiAuth,
			Models: []models.ModelInfo{
				{
					ID:          "gemini-3.8-flash-high",
					Name:        "Gemini 3.8 Flash High",
					Description: "Fast, deep reasoning agent with native tool execution",
					IsDefault:   true,
				},
				{
					ID:          "gemini-2.5-pro",
					Name:        "Gemini 2.5 Pro",
					Description: "Advanced multimodal coding & multi-file architectural refactoring",
				},
			},
		},
		{
			ID:           models.ProviderClaude,
			Name:         "Claude Code",
			Badge:        "Anthropic",
			IconColor:    "#D97706",
			IsConfigured: true,
			AuthStatus:   claudeAuth,
			Models: []models.ModelInfo{
				{
					ID:          "claude-3.7-sonnet-thinking",
					Name:        "Claude 3.7 Sonnet (Thinking)",
					Description: "Hybrid reasoning with adjustable thinking budget",
					IsDefault:   true,
				},
				{
					ID:          "claude-3.5-sonnet",
					Name:        "Claude 3.5 Sonnet",
					Description: "Benchmark leader for agentic terminal & editing tasks",
				},
				{
					ID:          "claude-3.5-haiku",
					Name:        "Claude 3.5 Haiku",
					Description: "Ultra-fast lightweight completion & linting agent",
				},
			},
		},
		{
			ID:           models.ProviderCodex,
			Name:         "OpenAI Codex",
			Badge:        "OpenAI",
			IconColor:    "#10A37F",
			IsConfigured: true,
			AuthStatus:   openaiAuth,
			Models: []models.ModelInfo{
				{
					ID:          "gpt-4o",
					Name:        "GPT-4o",
					Description: "Versatile flagship model with high-throughput tool chaining",
					IsDefault:   true,
				},
				{
					ID:          "o3-mini",
					Name:        "o3-mini",
					Description: "Specialized math, logic and coding reasoning engine",
				},
				{
					ID:          "o1",
					Name:        "o1",
					Description: "Maximum-depth reasoning for complex algorithms",
				},
			},
		},
		{
			ID:           models.ProviderCursor,
			Name:         "Cursor Agent",
			Badge:        "Cursor",
			IconColor:    "#8B5CF6",
			IsConfigured: true,
			AuthStatus:   "authenticated",
			Models: []models.ModelInfo{
				{
					ID:          "cursor-fast",
					Name:        "Cursor Fast",
					Description: "Optimized low-latency speculative edits",
					IsDefault:   true,
				},
				{
					ID:          "claude-3.5-sonnet-cursor",
					Name:        "Claude 3.5 Sonnet (Cursor)",
					Description: "Custom system prompt with Cursor indexing harness",
				},
			},
		},
		{
			ID:           models.ProviderGrok,
			Name:         "Grok Build",
			Badge:        "xAI",
			IconColor:    "#EC4899",
			IsConfigured: true,
			AuthStatus:   grokAuth,
			Models: []models.ModelInfo{
				{
					ID:          "grok-beta",
					Name:        "Grok Beta",
					Description: "Real-time context ingestion with deep reasoning capabilities",
					IsDefault:   true,
				},
			},
		},
		{
			ID:           models.ProviderOpenCode,
			Name:         "OpenCode",
			Badge:        "Open Weights",
			IconColor:    "#06B6D4",
			IsConfigured: true,
			AuthStatus:   "authenticated",
			Models: []models.ModelInfo{
				{
					ID:          "deepseek-r1",
					Name:        "DeepSeek R1",
					Description: "Open-weights reasoning model with chain-of-thought",
					IsDefault:   true,
				},
			},
		},
	}
}
