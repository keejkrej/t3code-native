import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';
import { ToolCall } from '../../types';
import { Icon, IconName } from '../ui/Icon';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getToolIcon = (name: string): IconName => {
    switch (name) {
      case 'run_command':
        return 'Terminal';
      case 'view_file':
      case 'client_view_file':
        return 'Eye';
      case 'client_create_file':
      case 'client_edit_file':
        return 'FileCode';
      case 'grep_search':
      case 'find_by_name':
        return 'Search';
      default:
        return 'Cpu';
    }
  };

  const copyResult = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        typeof toolCall.result === 'string'
          ? toolCall.result
          : JSON.stringify(toolCall.result, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedOutput =
    typeof toolCall.result === 'string'
      ? toolCall.result
      : toolCall.result
      ? JSON.stringify(toolCall.result, null, 2)
      : null;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }: any) => [
          styles.row,
          pressed && styles.rowHover,
          isExpanded && styles.rowExpanded,
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.left}>
          <Icon
            name={getToolIcon(toolCall.name)}
            size={13}
            color={toolCall.status === 'failed' ? colors.accentRose : colors.textMuted}
          />
          <Text style={styles.label} numberOfLines={1}>
            {toolCall.summary || toolCall.name}
          </Text>
        </View>

        <View style={styles.right}>
          {toolCall.durationMs && (
            <Text style={styles.duration}>{toolCall.durationMs}ms</Text>
          )}

          {toolCall.status === 'running' && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}

          {toolCall.status === 'success' && (
            <Icon name="Check" size={12} color={colors.accentEmerald} strokeWidth={2.5} />
          )}

          {toolCall.status === 'failed' && (
            <Icon name="X" size={12} color={colors.accentRose} strokeWidth={2.5} />
          )}

          <Icon
            name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
            size={12}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.expandedDetails}>
          {toolCall.parameters && Object.keys(toolCall.parameters).length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Parameters</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText} selectable>
                  {JSON.stringify(toolCall.parameters, null, 2)}
                </Text>
              </View>
            </View>
          )}

          {formattedOutput && (
            <View style={styles.detailSection}>
              <View style={styles.outputHeader}>
                <Text style={styles.detailLabel}>Output</Text>
                <Pressable onPress={copyResult} style={styles.copyBtn}>
                  <Icon name={copied ? 'Check' : 'Copy'} size={10} color={colors.textMuted} />
                  <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
                </Pressable>
              </View>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText} selectable>
                  {formattedOutput}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s ease' as any,
  },
  rowHover: {
    backgroundColor: '#131418',
  },
  rowExpanded: {
    backgroundColor: '#131418',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 12.5,
    fontFamily: typography.monoFontFamily,
    fontWeight: typography.weights.normal,
    flexShrink: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    color: '#71717a',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  expandedDetails: {
    backgroundColor: '#0c0d10',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#1c1d22',
    padding: 10,
    marginTop: 4,
    gap: 8,
  },
  detailSection: {
    gap: 4,
  },
  detailLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
    fontFamily: typography.fontFamily,
    textTransform: 'uppercase',
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  copyBtnText: {
    color: '#71717a',
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
  codeContainer: {
    backgroundColor: '#070809',
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#18191f',
    padding: 8,
    maxHeight: 220,
    overflow: 'hidden',
  },
  codeText: {
    color: '#d4d4d8',
    fontSize: 11.5,
    fontFamily: typography.monoFontFamily,
    lineHeight: 17,
  },
});
