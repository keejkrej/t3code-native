package config

import (
	"flag"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"time"

	"github.com/pingdotgg/t3code/server/internal/models"
)

const (
	DefaultPort    = 3773
	DefaultHost    = "0.0.0.0"
	CurrentVersion = "1.0.0"
)

// AppConfig wraps runtime server configuration
type AppConfig struct {
	Port      int
	Host      string
	Cwd       string
	AuthToken string
	Version   string
	Platform  string
	StartedAt time.Time
}

// ParseFlags parses command line flags and env variables
func ParseFlags() *AppConfig {
	defaultCwd, err := os.Getwd()
	if err != nil {
		defaultCwd = "."
	}

	portFlag := flag.Int("port", DefaultPort, "HTTP and WebSocket server port")
	hostFlag := flag.String("host", DefaultHost, "HTTP and WebSocket bind host")
	cwdFlag := flag.String("cwd", defaultCwd, "Working directory of the target project")
	authTokenFlag := flag.String("auth-token", "", "Optional authentication token for clients")

	flag.Parse()

	port := *portFlag
	if envPort := os.Getenv("T3_PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			port = p
		}
	} else if envPort := os.Getenv("PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			port = p
		}
	}

	host := *hostFlag
	if envHost := os.Getenv("T3_HOST"); envHost != "" {
		host = envHost
	}

	cwd := *cwdFlag
	if envCwd := os.Getenv("T3_CWD"); envCwd != "" {
		cwd = envCwd
	}
	cwd, _ = filepath.Abs(cwd)

	authToken := *authTokenFlag
	if envToken := os.Getenv("T3_AUTH_TOKEN"); envToken != "" {
		authToken = envToken
	}

	return &AppConfig{
		Port:      port,
		Host:      host,
		Cwd:       cwd,
		AuthToken: authToken,
		Version:   CurrentVersion,
		Platform:  runtime.GOOS + "/" + runtime.GOARCH,
		StartedAt: time.Now(),
	}
}

// ToModel converts AppConfig to models.ServerConfig
func (c *AppConfig) ToModel() models.ServerConfig {
	return models.ServerConfig{
		Port:      c.Port,
		Host:      c.Host,
		Cwd:       c.Cwd,
		AuthToken: c.AuthToken,
		Version:   c.Version,
		Platform:  c.Platform,
		StartedAt: c.StartedAt,
	}
}
