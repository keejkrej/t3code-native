import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { DiffViewer } from '../diff/DiffViewer';
import { TerminalView } from '../terminal/TerminalView';
import { FileTree } from '../files/FileTree';

export const Inspector: React.FC = () => {
  const {
    rightPanelMode,
    setRightPanelMode,
    toggleRightPanel,
    projects,
    activeProjectId,
    fileDiffs,
    setSelectedDiffFile,
  } = useAppStore();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const totalAdditions = fileDiffs.reduce((sum, d) => sum + d.additions, 0);
  const totalDeletions = fileDiffs.reduce((sum, d) => sum + d.deletions, 0);

  // If in Workspace Details mode (matches OG T3 Code Thread details card floating on canvas)
  if (rightPanelMode === 'workspace') {
    return (
      <View style={styles.floatingCardWrapper}>
        <View style={styles.detailsCard}>
          {/* Section 1: Workspace */}
          <View style={styles.cardSection}>
            {/* Machine Row */}
            <Pressable style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <Icon name="Laptop" size={13.5} color={colors.textSecondary} />
                <Text style={styles.rowLabel}>Local Workstation</Text>
              </View>
              <Icon name="ChevronDown" size={12} color={colors.textMuted} />
            </Pressable>

            {/* Editor Row */}
            <Pressable style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <Icon name="Box" size={13.5} color={colors.textSecondary} />
                <Text style={styles.rowLabel}>Open in Cursor</Text>
              </View>
              <Icon name="ChevronDown" size={12} color={colors.textMuted} />
            </Pressable>

            {/* Project Script Row */}
            <Pressable style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <Icon name="Plus" size={13} color={colors.textMuted} />
                <Text style={styles.rowMutedLabel}>Add project script</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.cardDivider} />

          {/* Section 2: Version Control */}
          <View style={styles.cardSection}>
            {/* Branch Row */}
            <Pressable style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <Icon name="GitBranch" size={13.5} color={colors.textSecondary} />
                <Text style={styles.rowLabel}>{activeProject?.branch || 'main'}</Text>
              </View>
              <Icon name="ChevronDown" size={12} color={colors.textMuted} />
            </Pressable>

            {/* Commit / Push Row */}
            <Pressable style={styles.detailRow}>
              <View style={styles.rowLeft}>
                <Icon name="GitCommit" size={13.5} color={colors.textSecondary} />
                <Text style={styles.rowLabel}>Commit</Text>
              </View>
              <Icon name="ChevronDown" size={12} color={colors.textMuted} />
            </Pressable>

            {/* Changes Row */}
            <Pressable
              style={styles.detailRow}
              onPress={() => setRightPanelMode('diffs')}
            >
              <View style={styles.rowLeft}>
                <Icon name="FileCode" size={13.5} color={colors.textSecondary} />
                <Text style={styles.rowLabel}>Changes</Text>
              </View>
              <View style={styles.diffCounts}>
                <Text style={styles.additionCount}>+{totalAdditions}</Text>
                <Text style={styles.deletionCount}>-{totalDeletions}</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Diffs / Changes Mode (matches OG T3 Code Diff tab view)
  return (
    <View style={styles.diffPanelContainer}>
      {/* Top Header Tab Bar */}
      <View style={styles.diffHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.activeTabPill}>
            <Icon name="FileCode" size={13} color={colors.text} />
            <Text style={styles.activeTabText}>Diff</Text>
          </View>
          <Pressable style={styles.addTabBtn} title="Add panel surface">
            <Icon name="Plus" size={13} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} title="Maximize panel">
            <Icon name="Maximize2" size={13} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setRightPanelMode('closed')}
            title="Close panel"
          >
            <Icon name="X" size={13} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Sub-toolbar */}
      <View style={styles.subToolbar}>
        <View style={styles.subLeft}>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setRightPanelMode('workspace')}
          >
            <Text style={styles.dropdownTriggerText}>Changes</Text>
            <Icon name="ChevronDown" size={12} color={colors.textMuted} />
          </Pressable>

          <Text style={styles.branchComparisonText}>
            {activeProject?.branch || 'main'} → origin/{activeProject?.branch || 'main'}
          </Text>
        </View>

        <View style={styles.subRight}>
          <Pressable style={styles.iconBtn} title="Refresh diff">
            <Icon name="RefreshCw" size={12} color={colors.textMuted} />
          </Pressable>
          <Pressable style={styles.iconBtn} title="Stacked diff view">
            <Icon name="Columns" size={12} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Diff Viewer Body */}
      <View style={styles.diffBody}>
        <DiffViewer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingCardWrapper: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 280,
    zIndex: 25,
  },
  detailsCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#191919',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
  cardSection: {
    paddingVertical: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 12,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  rowMutedLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily,
  },
  diffCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  additionCount: {
    color: '#4ade80',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  deletionCount: {
    color: '#f87171',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#191919',
    marginHorizontal: 10,
    marginVertical: 3,
  },
  diffPanelContainer: {
    width: 440,
    backgroundColor: '#0a0a0a',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    flexDirection: 'column',
    height: '100%',
  },
  diffHeader: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    backgroundColor: '#000000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191b22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#262933',
    gap: 6,
  },
  activeTabText: {
    color: colors.text,
    fontSize: 12,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  addTabBtn: {
    padding: 4,
    borderRadius: borderRadius.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subToolbar: {
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    backgroundColor: '#08080a',
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownTriggerText: {
    color: colors.text,
    fontSize: 12,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  branchComparisonText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  subRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  diffBody: {
    flex: 1,
  },
});
