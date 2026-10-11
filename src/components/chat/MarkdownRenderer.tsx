import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { Icon } from '../ui/Icon';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split into lines/blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Closing fence
        const codeText = codeBlockLines.join('\n');
        blocks.push(
          <CodeBlockView
            key={`code-${i}`}
            language={codeBlockLang || 'text'}
            code={codeText}
          />
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockLines = [];
      } else {
        // Opening fence
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      blocks.push(
        <Text key={`h3-${i}`} style={styles.h3}>
          {renderFormattedText(line.slice(4))}
        </Text>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <Text key={`h2-${i}`} style={styles.h2}>
          {renderFormattedText(line.slice(3))}
        </Text>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <Text key={`h1-${i}`} style={styles.h1}>
          {renderFormattedText(line.slice(2))}
        </Text>
      );
      continue;
    }

    // Alert Callouts
    if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || line.startsWith('> [!IMPORTANT]') || line.startsWith('> [!WARNING]')) {
      const alertType = line.includes('NOTE')
        ? 'NOTE'
        : line.includes('TIP')
        ? 'TIP'
        : line.includes('WARNING')
        ? 'WARNING'
        : 'IMPORTANT';
      const alertContent = lines[i + 1]?.startsWith('>') ? lines[i + 1].slice(1).trim() : '';
      blocks.push(
        <View key={`alert-${i}`} style={[styles.alertContainer, getAlertStyle(alertType)]}>
          <Text style={[styles.alertTitle, getAlertTitleStyle(alertType)]}>{alertType}</Text>
          {alertContent ? (
            <Text style={styles.alertText}>{renderFormattedText(alertContent)}</Text>
          ) : null}
        </View>
      );
      if (alertContent) i++; // skip next line
      continue;
    }

    // Bullet items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const itemText = line.trim().slice(2);
      blocks.push(
        <View key={`bullet-${i}`} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{renderFormattedText(itemText)}</Text>
        </View>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      blocks.push(
        <View key={`num-${i}`} style={styles.bulletRow}>
          <Text style={styles.numberIndex}>{numMatch[1]}.</Text>
          <Text style={styles.bulletText}>{renderFormattedText(numMatch[2])}</Text>
        </View>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      blocks.push(<View key={`empty-${i}`} style={styles.spacer} />);
      continue;
    }

    // Normal paragraph
    blocks.push(
      <Text key={`p-${i}`} style={styles.paragraph} selectable>
        {renderFormattedText(line)}
      </Text>
    );
  }

  // Close unclosed code block
  if (inCodeBlock && codeBlockLines.length > 0) {
    blocks.push(
      <CodeBlockView
        key={`code-end`}
        language={codeBlockLang || 'text'}
        code={codeBlockLines.join('\n')}
      />
    );
  }

  return <View style={styles.container}>{blocks}</View>;
};

// Formatted text helper: bold, italic, inline code
function renderFormattedText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex to match inline code `...`, bold **...**, or normal text
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <Text key={`code-${match.index}`} style={styles.inlineCode}>
          {token.slice(1, -1)}
        </Text>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <Text key={`bold-${match.index}`} style={styles.boldText}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <Text key={`italic-${match.index}`} style={styles.italicText}>
          {token.slice(1, -1)}
        </Text>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Code block view with copy button
const CodeBlockView: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.codeBlockContainer}>
      <View style={styles.codeBlockHeader}>
        <Text style={styles.codeLangText}>{language || 'code'}</Text>
        <Pressable onPress={handleCopy} style={styles.copyButton}>
          <Icon name={copied ? 'Check' : 'Copy'} size={12} color={colors.textMuted} />
          <Text style={styles.copyButtonText}>{copied ? 'Copied' : 'Copy'}</Text>
        </Pressable>
      </View>
      <View style={styles.codeContent}>
        <Text style={styles.codeContentText} selectable>
          {code}
        </Text>
      </View>
    </View>
  );
};

function getAlertStyle(type: string) {
  if (type === 'NOTE') return { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' };
  if (type === 'TIP') return { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' };
  if (type === 'WARNING') return { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' };
  return { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.3)' };
}

function getAlertTitleStyle(type: string) {
  if (type === 'NOTE') return { color: colors.accentBlue };
  if (type === 'TIP') return { color: colors.accentEmerald };
  if (type === 'WARNING') return { color: colors.accentAmber };
  return { color: colors.accentPurple };
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  spacer: {
    height: 8,
  },
  paragraph: {
    color: colors.text,
    fontSize: typography.sizes.base,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  italicText: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: typography.monoFontFamily,
    fontSize: typography.sizes.xs,
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    color: colors.primaryLight,
  },
  h1: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginTop: 12,
    marginBottom: 6,
  },
  h2: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginTop: 10,
    marginBottom: 4,
  },
  h3: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    marginTop: 8,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 9,
    marginRight: 8,
  },
  numberIndex: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontFamily: typography.monoFontFamily,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.base,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
  },
  codeBlockContainer: {
    backgroundColor: '#07080a',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 8,
    overflow: 'hidden',
  },
  codeBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  codeLangText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.monoFontFamily,
    textTransform: 'uppercase',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  copyButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
  codeContent: {
    padding: spacing.md,
  },
  codeContentText: {
    color: '#e5e7eb',
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    lineHeight: 20,
  },
  alertContainer: {
    borderLeftWidth: 3,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: 6,
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  alertText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
