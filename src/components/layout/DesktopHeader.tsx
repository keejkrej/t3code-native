import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

// Global Electron Desktop Bridge definition
declare global {
  interface Window {
    t3Desktop?: {
      platform: string;
      arch: string;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isMaximized: () => Promise<boolean>;
      openExternal: (url: string) => Promise<void>;
      selectDirectory: () => Promise<string | null>;
      onWindowMaximizeChange: (cb: (isMaximized: boolean) => void) => () => void;
    };
  }
}

export const DesktopHeader: React.FC = () => {
  const {
    projects,
    activeProjectId,
    threads,
    activeThreadId,
    isSidebarOpen,
    isInspectorOpen,
    toggleSidebar,
    toggleInspector,
    openCommandPalette,
    openSettings,
    connectionStatus,
    currentEnvironmentId,
    environments,
  } = useAppStore();

  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && !!window.t3Desktop;

  useEffect(() => {
    if (window.t3Desktop?.onWindowMaximizeChange) {
      return window.t3Desktop.onWindowMaximizeChange((max) => {
        setIsMaximized(max);
      });
    }
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const currentEnv = environments.find((e) => e.id === currentEnvironmentId);

  return (
    <View style={styles.header}>
      {/* Left: Window title and brand */}
      <View style={styles.leftGroup}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>T3</Text>
          </View>
          <Text style={styles.brandName}>Code</Text>
          <View style={styles.nativeBadge}>
            <Text style={styles.nativeBadgeText}>REACT NATIVE</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Project & Branch Breadcrumb */}
        {activeProject && (
          <View style={styles.breadcrumb}>
            <Text style={styles.projectIcon}>{activeProject.icon}</Text>
            <Text style={styles.projectName}>{activeProject.name}</Text>
            <View style={styles.branchPill}>
              <Icon name="GitBranch" size={12} color={colors.textSecondary} />
              <Text style={styles.branchName}>{activeProject.branch}</Text>
            </View>
            {activeProject.status === 'dirty' && (
              <View style={styles.dirtyDot} />
            )}
          </View>
        )}
      </View>

      {/* Center: Command Palette Trigger */}
      <Pressable
        style={styles.searchBar}
        onPress={openCommandPalette}
      >
        <Icon name="Search" size={13} color={colors.textMuted} />
        <Text style={styles.searchText}>
          {activeThread ? activeThread.title : 'Search threads, files, commands...'}
        </Text>
        <View style={styles.shortcutPill}>
          <Text style={styles.shortcutText}>Ctrl K</Text>
        </View>
      </Pressable>

      {/* Right: Environment, Layout toggles, Settings, Window Controls */}
      <View style={styles.rightGroup}>
        {/* Environment Status */}
        <View style={styles.envPill}>
          <View
            style={[
              styles.statusDot,
              connectionStatus === 'connected' && styles.statusOnline,
              connectionStatus === 'connecting' && styles.statusConnecting,
              connectionStatus === 'disconnected' && styles.statusOffline,
            ]}
          />
          <Text style={styles.envName}>{currentEnv?.name ?? 'Local (3773)'}</Text>
        </View>

        {/* Toggle Sidebar */}
        <Button
          icon="Sidebar"
          variant="ghost"
          size="sm"
          onPress={toggleSidebar}
          style={isSidebarOpen ? styles.activeToolButton : undefined}
        />

        {/* Toggle Inspector / Diffs */}
        <Button
          icon="Terminal"
          variant="ghost"
          size="sm"
          onPress={toggleInspector}
          style={isInspectorOpen ? styles.activeToolButton : undefined}
        />

        {/* Settings */}
        <Button
          icon="Settings"
          variant="ghost"
          size="sm"
          onPress={openSettings}
        />

        {/* Electron Window Controls */}
        {isElectron && (
          <View style={styles.windowControls}>
            <Pressable
              style={styles.windowBtn}
              onPress={() => window.t3Desktop?.minimizeWindow()}
            >
              <Icon name="Minus" size={13} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={styles.windowBtn}
              onPress={() => window.t3Desktop?.maximizeWindow()}
            >
              <Icon
                name={isMaximized ? 'Minimize2' : 'Maximize2'}
                size={12}
                color={colors.textSecondary}
              />
            </Pressable>
            <Pressable
              style={[styles.windowBtn, styles.closeBtn]}
              onPress={() => window.t3Desktop?.closeWindow()}
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
    height: 44,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  brandName: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.2,
  },
  nativeBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    marginLeft: 6,
  },
  nativeBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectIcon: {
    fontSize: 13,
  },
  projectName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  branchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  branchName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentAmber,
  },
  searchBar: {
    flex: 1,
    maxWidth: 440,
    height: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  searchText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginLeft: 8,
    fontFamily: typography.fontFamily,
    overflow: 'hidden',
  },
  shortcutPill: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shortcutText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.weights.medium,
    fontFamily: typography.monoFontFamily,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  envPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    marginRight: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusOnline: {
    backgroundColor: colors.accentEmerald,
  },
  statusConnecting: {
    backgroundColor: colors.accentAmber,
  },
  statusOffline: {
    backgroundColor: colors.accentRose,
  },
  envName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  activeToolButton: {
    backgroundColor: colors.surfaceSelected,
    borderColor: colors.primaryMuted,
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
