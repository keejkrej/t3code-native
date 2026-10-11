import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { ToolCall } from '../../types';
import { Icon, IconName } from '../ui/Icon';
import { Badge } from '../ui/Badge';

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
    <View style={styles.card}>
      <Pressable
        style={styles.cardHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Icon name={getToolIcon(toolCall.name)} size={12} color={colors.textSecondary} />
          </View>
          <View style={styles.titleInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.toolName}>{toolCall.name}</Text>
              {toolCall.durationMs && (
                <Text style={styles.durationText}>{toolCall.durationMs}ms</Text>
              )}
            </View>
            <Text style={styles.summaryText} numberOfLines={1}>
              {toolCall.summary || JSON.stringify(toolCall.parameters)}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {toolCall.status === 'running' && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          {toolCall.status === 'success' && (
            <Badge label="Completed" variant="success" size="sm" />
          )}
          {toolCall.status === 'failed' && (
            <Badge label="Failed" variant="danger" size="sm" />
          )}
          <Icon
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={13}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.body}>
          {/* Parameters block */}
          {toolCall.parameters && Object.keys(toolCall.parameters).length > 0 && (
            <View style={styles.paramSection}>
              <Text style={styles.sectionHeader}>PARAMETERS</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText} selectable>
                  {JSON.stringify(toolCall.parameters, null, 2)}
                </Text>
              </View>
            </View>
          )}

          {/* Results block */}
          {formattedOutput && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Text style={styles.sectionHeader}>OUTPUT</Text>
                <Pressable onPress={copyResult} style={styles.copyBtn}>
                  <Icon name={copied ? 'Check' : 'Copy'} size={11} color={colors.textMuted} />
                  <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
                </Pressable>
              </View>
              <View style={styles.codeBlock}>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolName: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.monoFontFamily,
  },
  durationText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  body: {
    backgroundColor: colors.backgroundSubtle,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  paramSection: {
    gap: 4,
  },
  resultSection: {
    gap: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  copyText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
  codeBlock: {
    backgroundColor: '#07080a',
    borderRadius: borderRadius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  codeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    lineHeight: 18,
  },
});
