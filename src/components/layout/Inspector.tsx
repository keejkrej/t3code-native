import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DiffViewer } from '../diff/DiffViewer';
import { TerminalView } from '../terminal/TerminalView';
import { FileTree } from '../files/FileTree';

export const Inspector: React.FC = () => {
  const {
    activeInspectorTab,
    setInspectorTab,
    toggleInspector,
    fileDiffs,
    turns,
    activeThreadId,
  } = useAppStore();

  const currentTurns = activeThreadId ? turns[activeThreadId] || [] : [];
  const checkpoints = currentTurns
    .map((t) => t.checkpoint)
    .filter((cp): cp is NonNullable<typeof cp> => !!cp);

  const tabs: { id: 'diffs' | 'terminal' | 'files' | 'review'; label: string; icon: any; count?: number }[] = [
    { id: 'diffs', label: 'Changes', icon: 'FileCode', count: fileDiffs.length },
    { id: 'terminal', label: 'Terminal', icon: 'Terminal' },
    { id: 'files', label: 'Files', icon: 'Folder' },
    { id: 'review', label: 'Review', icon: 'GitCommit', count: checkpoints.length },
  ];

  return (
    <View style={styles.inspector}>
      {/* Inspector Tabs Header */}
      <View style={styles.header}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeInspectorTab;

            return (
              <Pressable
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                onPress={() => setInspectorTab(tab.id)}
              >
                <Icon
                  name={tab.icon}
                  size={12}
                  color={isActive ? colors.primaryLight : colors.textSecondary}
                />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
                {tab.count !== undefined && tab.count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.activeTabBadge]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.activeTabBadgeText]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Button
          icon="X"
          variant="ghost"
          size="xs"
          onPress={toggleInspector}
        />
      </View>

      {/* Tab Panels */}
      <View style={styles.content}>
        {activeInspectorTab === 'diffs' && <DiffViewer />}
        {activeInspectorTab === 'terminal' && <TerminalView />}
        {activeInspectorTab === 'files' && <FileTree />}
        {activeInspectorTab === 'review' && (
          <ScrollView style={styles.reviewScroll}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>CHECKPOINTS & TURNS</Text>
            </View>
            {checkpoints.map((cp) => (
              <View key={cp.id} style={styles.checkpointCard}>
                <View style={styles.cpTop}>
                  <View style={styles.cpTitleRow}>
                    <Icon name="GitCommit" size={13} color={colors.accentEmerald} />
                    <Text style={styles.cpMessage}>{cp.message}</Text>
                  </View>
                  <View style={styles.hashPill}>
                    <Text style={styles.hashText}>{cp.commitHash}</Text>
                  </View>
                </View>
                <View style={styles.cpBottom}>
                  <Text style={styles.cpTime}>{cp.timestamp}</Text>
                  <Text style={styles.cpFiles}>{cp.filesChanged} files modified</Text>
                </View>
              </View>
            ))}
            {checkpoints.length === 0 && (
              <View style={styles.emptyReview}>
                <Text style={styles.emptyReviewText}>No checkpoints recorded yet.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inspector: {
    width: 360,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    gap: 5,
  },
  activeTabBtn: {
    backgroundColor: colors.surfaceHover,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  activeTabLabel: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  tabBadge: {
    backgroundColor: colors.surfaceActive,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  activeTabBadge: {
    backgroundColor: colors.primaryMuted,
  },
  tabBadgeText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.monoFontFamily,
  },
  activeTabBadgeText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  reviewScroll: {
    flex: 1,
    padding: spacing.md,
  },
  reviewHeader: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  reviewTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  checkpointCard: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: 8,
    gap: 6,
  },
  cpTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cpMessage: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  hashPill: {
    backgroundColor: colors.surfaceActive,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  hashText: {
    color: colors.accentEmerald,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  cpBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cpTime: {
    color: colors.textMuted,
    fontSize: 10,
  },
  cpFiles: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  emptyReview: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyReviewText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
});
