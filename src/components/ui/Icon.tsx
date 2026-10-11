import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type IconName =
  | 'Terminal'
  | 'FileCode'
  | 'Folder'
  | 'FolderOpen'
  | 'FolderPlus'
  | 'GitBranch'
  | 'GitCommit'
  | 'GitPullRequest'
  | 'Sparkles'
  | 'Send'
  | 'ArrowUp'
  | 'Search'
  | 'Settings'
  | 'Plus'
  | 'X'
  | 'ChevronRight'
  | 'ChevronDown'
  | 'ChevronUp'
  | 'Check'
  | 'Copy'
  | 'ExternalLink'
  | 'RotateCcw'
  | 'Play'
  | 'Pause'
  | 'Square'
  | 'Sidebar'
  | 'Maximize2'
  | 'Minimize2'
  | 'Minus'
  | 'Layers'
  | 'Cpu'
  | 'Server'
  | 'Radio'
  | 'Command'
  | 'Code'
  | 'Eye'
  | 'EyeOff'
  | 'Trash2'
  | 'Paperclip'
  | 'Mic'
  | 'MicOff'
  | 'AlertCircle'
  | 'CheckCircle2'
  | 'Clock'
  | 'Compass'
  | 'ListFilter'
  | 'SquarePen'
  | 'Lock'
  | 'Laptop'
  | 'PanelLeft'
  | 'PanelRight'
  | 'PanelBottom'
  | 'PanelRightClose'
  | 'Columns'
  | 'FileText'
  | 'BarChart3'
  | 'Box'
  | 'RefreshCw'
  | 'Split'
  | 'WrapText'
  | 'SlidersHorizontal'
  | 'Brain'
  | string;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

const GLYPH_MAP: Record<string, string> = {
  Terminal: '❯_',
  FileCode: '📄',
  FileText: '📄',
  Folder: '📁',
  FolderOpen: '📂',
  FolderPlus: '📁⁺',
  GitBranch: '⎇',
  GitCommit: '○',
  GitPullRequest: '⫘',
  Sparkles: '✦',
  Send: '↑',
  ArrowUp: '↑',
  Search: '⌕',
  Settings: '⚙',
  Plus: '+',
  X: '✕',
  ChevronRight: '›',
  ChevronDown: '⌄',
  ChevronUp: '⌃',
  Check: '✓',
  Copy: '⎘',
  ExternalLink: '↗',
  RotateCcw: '↺',
  Play: '▶',
  Pause: '❚❚',
  Square: '■',
  Sidebar: '⊞',
  Maximize2: '⤢',
  Minimize2: '⤡',
  Minus: '−',
  Layers: '☷',
  Cpu: '⊞',
  Server: '⛁',
  Radio: '◉',
  Command: '⌘',
  Code: '</>',
  Eye: '👁',
  EyeOff: '⌀',
  Trash2: '🗑',
  Paperclip: '📎',
  Mic: '🎙',
  MicOff: '🎙⃠',
  AlertCircle: '⚠',
  CheckCircle2: '✓',
  Clock: '🕒',
  Compass: '🧭',
  ListFilter: '≡',
  SquarePen: '✎',
  Lock: '🔒',
  Laptop: '💻',
  PanelLeft: '◨',
  PanelRight: '◧',
  PanelBottom: '⬒',
  PanelRightClose: '◨',
  Columns: '▥',
  BarChart3: '📊',
  Box: '📦',
  RefreshCw: '↻',
  Split: '⫴',
  WrapText: '↩',
  SlidersHorizontal: '☵',
  Brain: '🧠',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color = '#9ca3af',
  style,
}) => {
  const glyph = GLYPH_MAP[name] || '•';

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text
        style={[
          styles.glyph,
          {
            fontSize: Math.round(size * 0.85),
            lineHeight: size,
            color,
          },
        ]}
      >
        {glyph}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
