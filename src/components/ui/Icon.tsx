import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName =
  | 'Terminal'
  | 'FileCode'
  | 'Folder'
  | 'FolderOpen'
  | 'GitBranch'
  | 'GitCommit'
  | 'GitPullRequest'
  | 'Sparkles'
  | 'Send'
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
  | 'Compass';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color = '#9ca3af',
  strokeWidth = 2,
}) => {
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};
