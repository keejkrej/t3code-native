import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { getProjectMonogram, getProjectColor } from '../../utils/projectMonogram';

export const WorkspaceHeader: React.FC = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
    projects,
    activeProjectId,
    threads,
    activeThreadId,
    isInspectorOpen,
    isTerminalDrawerOpen,
    rightPanelMode,
    toggleTerminalDrawer,
    toggleRightPanel,
    setRightPanelMode,
  } = useAppStore();

  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && !!(window as any).t3Desktop;

  useEffect(() => {
    if ((window as any).t3Desktop?.onWindowMaximizeChange) {
      return (window as any).t3Desktop.onWindowMaximizeChange((max: boolean) => {
        setIsMaximized(max);
      });
    }
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeThread = threads.find((t) => t.id === activeThreadId);

  const monogram = activeProject ? getProjectMonogram(activeProject.name) : 'TC';
  const projectColors = activeProject ? getProjectColor(activeProject.name) : { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };

  const isDetailsOpen = isInspectorOpen && rightPanelMode === 'workspace';
  const isDiffsOpen = isInspectorOpen && rightPanelMode === 'diffs';

  return (
    <View style={styles.header}>
      {/* Left: Breadcrumbs (Monogram + Project / Thread Title) */}
      <View style={styles.breadcrumb}>
        {!isSidebarOpen && (
          <Pressable
            style={styles.sidebarToggleBtn}
            onPress={toggleSidebar}
            title="Open Sidebar (Ctrl+B)"
          >
            <Icon name="PanelLeft" size={16} color={colors.textSecondary} />
          </Pressable>
        )}

        {activeProject && (
          <View style={styles.projectPill}>
            <View
              style={[
                styles.monogramBadge,
                { backgroundColor: projectColors.bg, borderColor: projectColors.border },
              ]}
            >
              <Text style={[styles.monogramText, { color: projectColors.text }]}>
                {monogram}
              </Text>
            </View>
            <Text style={styles.projectName}>{activeProject.name}</Text>
          </View>
        )}

        <Text style={styles.separator}>/</Text>

        <Text style={styles.threadTitle} numberOfLines={1}>
          {activeThread ? activeThread.title : 'New thread'}
        </Text>
      </View>

      {/* Right: Panel Actions (Details, Terminal, Right Panel) */}
      <View style={styles.rightActions}>
        {/* Toggle Details Panel */}
        <Pressable
          style={[
            styles.actionButton,
            isDetailsOpen && styles.activeActionButton,
          ]}
          onPress={() => {
            if (isDetailsOpen) {
              setRightPanelMode('closed');
            } else {
              setRightPanelMode('workspace');
            }
          }}
          title="Toggle thread details panel"
        >
          <Icon
            name="FileText"
            size={16}
            color={isDetailsOpen ? colors.text : colors.textMuted}
          />
        </Pressable>

        {/* Toggle Terminal Drawer */}
        <Pressable
          style={[
            styles.actionButton,
            isTerminalDrawerOpen && styles.activeActionButton,
          ]}
          onPress={toggleTerminalDrawer}
          title="Toggle terminal drawer"
        >
          <Icon
            name="PanelBottom"
            size={16}
            color={isTerminalDrawerOpen ? colors.text : colors.textMuted}
          />
        </Pressable>

        {/* Toggle Right Panel (Diffs) */}
        <Pressable
          style={[
            styles.actionButton,
            isDiffsOpen && styles.activeActionButton,
          ]}
          onPress={() => {
            if (isDiffsOpen) {
              setRightPanelMode('closed');
            } else {
              setRightPanelMode('diffs');
            }
          }}
          title="Toggle git diff panel"
        >
          <Icon
            name="PanelRightClose"
            size={16}
            color={isDiffsOpen ? colors.text : colors.textMuted}
          />
        </Pressable>

        {/* Electron Window Controls if inside desktop */}
        {isElectron && (
          <View style={styles.windowControls}>
            <Pressable
              style={styles.windowBtn}
              onPress={() => (window as any).t3Desktop?.minimizeWindow()}
            >
              <Icon name="Minus" size={13} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={styles.windowBtn}
              onPress={() => (window as any).t3Desktop?.maximizeWindow()}
            >
              <Icon
                name={isMaximized ? 'Minimize2' : 'Maximize2'}
                size={12}
                color={colors.textSecondary}
              />
            </Pressable>
            <Pressable
              style={[styles.windowBtn, styles.closeBtn]}
              onPress={() => (window as any).t3Desktop?.closeWindow()}
            >
              <Icon name="X" size={13} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 52,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: spacing.md,
  },
  sidebarToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16171d',
    marginRight: 2,
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monogramBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  monogramText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  projectName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  separator: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: typography.weights.normal,
  },
  threadTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
    flexShrink: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeActionButton: {
    backgroundColor: '#1f2026',
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 8,
  },
  windowBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xs,
  },
  closeBtn: {
    marginLeft: 2,
  },
});
