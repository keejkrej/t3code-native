import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { T3Wordmark } from './T3Wordmark';
import { SidebarStageBackdrop } from './SidebarStageBackdrop';
import { getProjectMonogram, getProjectColor } from '../../utils/projectMonogram';

export const Sidebar: React.FC = () => {
  const {
    projects,
    activeProjectId,
    threads,
    activeThreadId,
    setActiveProject,
    setActiveThread,
    openNewThreadModal,
    openSettings,
    deleteThread,
    toggleSidebar,
    providers,
  } = useAppStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [isSettledExpanded, setIsSettledExpanded] = useState(false);
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Filter threads for current project
  const currentThreads = threads.filter(
    (t) =>
      t.projectId === activeProjectId &&
      t.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <View style={styles.sidebar}>
      {/* 1. Blueprint Grid Stage Header */}
      <View style={styles.stageHeader}>
        <SidebarStageBackdrop />
        <View style={styles.stageContent}>
          <Pressable
            style={styles.toggleButton}
            onPress={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Icon name="Sidebar" size={16} color="rgba(255, 255, 255, 0.85)" />
          </Pressable>

          <Pressable
            style={styles.brandRow}
            onPress={() => {
              if (currentThreads[0]) setActiveThread(currentThreads[0].id);
            }}
          >
            <T3Wordmark size={18} color="#ffffff" />
            <Text style={styles.brandCodeText}>Code</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Search & Action Toolbar */}
      <View style={styles.toolbarRow}>
        <View style={styles.searchBox}>
          <Icon name="Search" size={13} color={colors.textMuted} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            value={searchFilter}
            onChangeText={setSearchFilter}
            style={styles.searchInput}
          />
          <Text style={styles.slashHint}>/</Text>
        </View>

        <View style={styles.toolbarActions}>
          <Pressable style={styles.toolbarBtn} title="Filter threads by project">
            <Icon name="ListFilter" size={14} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.toolbarBtn}
            onPress={openNewThreadModal}
            title="Add project"
          >
            <Icon name="FolderPlus" size={14} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.toolbarBtn}
            onPress={openNewThreadModal}
            title="New thread"
          >
            <Icon name="SquarePen" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* 3. Threads List */}
      <ScrollView style={styles.threadsList} showsVerticalScrollIndicator={false}>
        {currentThreads.map((thread) => {
          const isActive = thread.id === activeThreadId;
          const isHovered = hoveredThreadId === thread.id;
          const proj = projects.find((p) => p.id === thread.projectId) || activeProject;
          const projName = proj ? proj.name : 'server';
          const monogram = getProjectMonogram(projName);
          const pColor = getProjectColor(projName);

          return (
            <Pressable
              key={thread.id}
              style={[
                styles.threadCard,
                isActive && styles.activeThreadCard,
                isHovered && !isActive && styles.hoverThreadCard,
              ]}
              onPress={() => setActiveThread(thread.id)}
              // @ts-ignore
              onMouseEnter={() => setHoveredThreadId(thread.id)}
              onMouseLeave={() => setHoveredThreadId(null)}
            >
              {/* Top Row: Monogram + Project Name + Time */}
              <View style={styles.threadTopRow}>
                <View style={styles.projectMonogramGroup}>
                  <View
                    style={[
                      styles.monogramBadge,
                      { backgroundColor: pColor.bg, borderColor: pColor.border },
                    ]}
                  >
                    <Text style={[styles.monogramText, { color: pColor.text }]}>
                      {monogram}
                    </Text>
                  </View>
                  <Text style={styles.projectLabel} numberOfLines={1}>
                    {projName}
                  </Text>
                </View>
                <Text style={styles.timeLabel}>{thread.updatedAt || 'now'}</Text>
              </View>

              {/* Bottom Row: Title + AI/Status Icon or Settle button on hover */}
              <View style={styles.threadBottomRow}>
                <Text
                  style={[styles.threadTitle, isActive && styles.activeThreadTitle]}
                  numberOfLines={1}
                >
                  {thread.title}
                </Text>

                <View style={styles.trailingAction}>
                  {isActive && isHovered ? (
                    <Pressable
                      style={styles.settleButton}
                      onPress={(e: any) => {
                        e.stopPropagation?.();
                        deleteThread(thread.id);
                      }}
                      title="Settle thread"
                    >
                      <Text style={styles.settleText}>Settle</Text>
                    </Pressable>
                  ) : (
                    <Icon name="Sparkles" size={13} color={colors.textMuted} />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}

        {currentThreads.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No threads yet</Text>
            <Pressable style={styles.emptyNewBtn} onPress={openNewThreadModal}>
              <Icon name="SquarePen" size={13} color={colors.primaryLight} />
              <Text style={styles.emptyNewText}>Start a new thread</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* 4. Settled (0) Section */}
      <Pressable
        style={styles.settledHeader}
        onPress={() => setIsSettledExpanded(!isSettledExpanded)}
      >
        <Text style={styles.settledTitle}>Settled (0)</Text>
        <Icon
          name={isSettledExpanded ? 'ChevronDown' : 'ChevronRight'}
          size={12}
          color={colors.textMuted}
        />
      </Pressable>

      {/* 5. Sidebar Bottom Utility Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.footerIconBtn}
          onPress={() => openSettings()}
          title="Settings"
        >
          <Icon name="Settings" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.footerIconBtn}
          title="Pull Requests"
        >
          <Icon name="GitPullRequest" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.footerIconBtn}
          title="Usage"
        >
          <Icon name="BarChart3" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    height: '100%',
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderRightColor: colors.sidebarBorder,
    flexDirection: 'column',
    zIndex: 20,
  },
  stageHeader: {
    height: 52,
    position: 'relative',
    overflow: 'hidden',
  },
  stageContent: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: spacing.sm,
    gap: 8,
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandCodeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: 8,
    height: 30,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginLeft: 6,
    padding: 0,
  },
  slashHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  toolbarBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadsList: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  threadCard: {
    borderRadius: borderRadius.md,
    padding: 10,
    marginVertical: 2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  hoverThreadCard: {
    backgroundColor: '#121317',
  },
  activeThreadCard: {
    backgroundColor: '#18191f',
    borderColor: '#262832',
  },
  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectMonogramGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  monogramBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  monogramText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  projectLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  timeLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  threadBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  threadTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: typography.weights.normal,
    fontFamily: typography.fontFamily,
    flex: 1,
    marginRight: 6,
  },
  activeThreadTitle: {
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  trailingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleButton: {
    backgroundColor: '#262832',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  settleText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceHover,
  },
  emptyNewText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: typography.weights.medium,
  },
  settledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  settledTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  footer: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: colors.sidebarBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: 12,
    backgroundColor: '#000000',
  },
  footerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
