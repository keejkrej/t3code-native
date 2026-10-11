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
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Sidebar: React.FC = () => {
  const {
    projects,
    activeProjectId,
    threads,
    activeThreadId,
    setActiveProject,
    setActiveThread,
    openNewThreadModal,
    deleteThread,
    providers,
  } = useAppStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Filter threads for current project
  const currentThreads = threads.filter(
    (t) =>
      t.projectId === activeProjectId &&
      t.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case 'claude':
        return colors.claude;
      case 'codex':
        return colors.codex;
      case 'cursor':
        return colors.cursor;
      case 'grok':
        return colors.grok;
      case 'opencode':
        return colors.opencode;
      case 'antigravity':
        return colors.antigravity;
      default:
        return colors.textSecondary;
    }
  };

  const getProviderBadge = (providerId: string) => {
    const p = providers.find((prov) => prov.id === providerId);
    return p?.badge || 'AI';
  };

  return (
    <View style={styles.sidebar}>
      {/* Active Project Selector */}
      <View style={styles.projectSection}>
        <Pressable
          style={styles.projectCard}
          onPress={() => setIsProjectsExpanded(!isProjectsExpanded)}
        >
          <View style={styles.projectLeft}>
            <View style={styles.projectIconBadge}>
              <Text style={styles.projectIconText}>{activeProject?.icon ?? '📂'}</Text>
            </View>
            <View style={styles.projectMeta}>
              <Text style={styles.projectName} numberOfLines={1}>
                {activeProject?.name ?? 'Select Project'}
              </Text>
              <Text style={styles.projectPath} numberOfLines={1}>
                {activeProject?.path ?? ''}
              </Text>
            </View>
          </View>
          <Icon
            name={isProjectsExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={14}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* Project Switcher Dropdown */}
        {isProjectsExpanded && (
          <View style={styles.projectsDropdown}>
            <Text style={styles.dropdownHeader}>RECENT WORKSPACES</Text>
            {projects.map((proj) => (
              <Pressable
                key={proj.id}
                style={[
                  styles.dropdownProjectItem,
                  proj.id === activeProjectId && styles.activeDropdownItem,
                ]}
                onPress={() => {
                  setActiveProject(proj.id);
                  setIsProjectsExpanded(false);
                }}
              >
                <Text style={styles.dropdownIcon}>{proj.icon}</Text>
                <View style={styles.dropdownProjectInfo}>
                  <Text style={styles.dropdownProjectName}>{proj.name}</Text>
                  <Text style={styles.dropdownProjectBranch}>{proj.branch}</Text>
                </View>
                {proj.id === activeProjectId && (
                  <Icon name="Check" size={13} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Threads Section Header */}
      <View style={styles.threadsHeader}>
        <View style={styles.threadsHeaderLeft}>
          <Text style={styles.sectionTitle}>CONVERSATIONS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{currentThreads.length}</Text>
          </View>
        </View>
        <Button
          icon="Plus"
          variant="ghost"
          size="xs"
          onPress={openNewThreadModal}
        />
      </View>

      {/* Search Threads */}
      <View style={styles.searchContainer}>
        <Icon name="Search" size={12} color={colors.textMuted} />
        <TextInput
          placeholder="Filter threads..."
          placeholderTextColor={colors.textMuted}
          value={searchFilter}
          onChangeText={setSearchFilter}
          style={styles.searchInput}
        />
        {searchFilter.length > 0 && (
          <Pressable onPress={() => setSearchFilter('')}>
            <Icon name="X" size={12} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Threads List */}
      <ScrollView style={styles.threadsList} showsVerticalScrollIndicator={false}>
        {currentThreads.map((thread) => {
          const isActive = thread.id === activeThreadId;
          const providerColor = getProviderColor(thread.provider);
          const badgeText = getProviderBadge(thread.provider);

          return (
            <Pressable
              key={thread.id}
              style={[styles.threadItem, isActive && styles.activeThreadItem]}
              onPress={() => setActiveThread(thread.id)}
            >
              <View style={styles.threadItemContent}>
                {/* Header row: Provider badge & time */}
                <View style={styles.threadTopRow}>
                  <View style={styles.providerBadgeContainer}>
                    <View
                      style={[
                        styles.providerTag,
                        { backgroundColor: `${providerColor}20`, borderColor: `${providerColor}40` },
                      ]}
                    >
                      <Text style={[styles.providerTagText, { color: providerColor }]}>
                        {badgeText}
                      </Text>
                    </View>
                    <Text style={styles.modelName} numberOfLines={1}>
                      {thread.model}
                    </Text>
                  </View>
                  <Text style={styles.threadTime}>{thread.updatedAt}</Text>
                </View>

                {/* Title */}
                <Text
                  style={[styles.threadTitle, isActive && styles.activeThreadTitle]}
                  numberOfLines={2}
                >
                  {thread.title}
                </Text>

                {/* Footer: Branch & Status */}
                <View style={styles.threadBottomRow}>
                  <View style={styles.threadBranch}>
                    <Icon name="GitBranch" size={10} color={colors.textMuted} />
                    <Text style={styles.threadBranchText}>{thread.branch}</Text>
                  </View>
                  {thread.status === 'running' && (
                    <Badge label="Running" variant="warning" size="sm" />
                  )}
                </View>
              </View>

              {/* Delete action on hover / right button */}
              {isActive && (
                <Pressable
                  style={styles.deleteThreadBtn}
                  onPress={() => deleteThread(thread.id)}
                >
                  <Icon name="Trash2" size={12} color={colors.textMuted} />
                </Pressable>
              )}
            </Pressable>
          );
        })}

        {currentThreads.length === 0 && (
          <View style={styles.emptyThreads}>
            <Text style={styles.emptyThreadsText}>No threads found</Text>
            <Button
              label="New Thread"
              icon="Plus"
              variant="outline"
              size="sm"
              onPress={openNewThreadModal}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Sidebar Action Bar */}
      <View style={styles.sidebarFooter}>
        <Button
          label="New Thread"
          icon="Plus"
          variant="primary"
          size="sm"
          onPress={openNewThreadModal}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    flexDirection: 'column',
    height: '100%',
  },
  projectSection: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    position: 'relative',
    zIndex: 20,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectIconBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  projectIconText: {
    fontSize: 14,
  },
  projectMeta: {
    flex: 1,
  },
  projectName: {
    color: colors.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  projectPath: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  projectsDropdown: {
    position: 'absolute',
    top: 56,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  dropdownHeader: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dropdownProjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: borderRadius.sm,
  },
  activeDropdownItem: {
    backgroundColor: colors.surfaceActive,
  },
  dropdownIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  dropdownProjectInfo: {
    flex: 1,
  },
  dropdownProjectName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  dropdownProjectBranch: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  threadsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 4,
  },
  threadsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  countBadge: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  countBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    marginHorizontal: spacing.sm,
    marginVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    height: 28,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginLeft: 6,
    padding: 0,
    // @ts-ignore
    outlineWidth: 0,
  },
  threadsList: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  threadItem: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: borderRadius.md,
    marginVertical: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  activeThreadItem: {
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.border,
  },
  threadItemContent: {
    flex: 1,
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  providerTagText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  modelName: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
    maxWidth: 120,
  },
  threadTime: {
    color: colors.textMuted,
    fontSize: 10,
  },
  threadTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: 18,
    marginBottom: 6,
  },
  activeThreadTitle: {
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  threadBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threadBranch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threadBranchText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  deleteThreadBtn: {
    padding: 6,
    borderRadius: borderRadius.xs,
    marginLeft: 4,
  },
  emptyThreads: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyThreadsText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  sidebarFooter: {
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
});
