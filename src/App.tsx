import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from './theme';
import { useAppStore } from './state/useAppStore';
import { WorkspaceHeader } from './components/layout/WorkspaceHeader';
import { Sidebar } from './components/layout/Sidebar';
import { Inspector } from './components/layout/Inspector';
import { ChatView } from './components/chat/ChatView';
import { Composer } from './components/composer/Composer';
import { TerminalDrawer } from './components/terminal/TerminalDrawer';
import { CommandPalette } from './components/modals/CommandPalette';
import { SettingsView } from './components/settings/SettingsView';
import { NewThreadModal } from './components/modals/NewThreadModal';

export const App: React.FC = () => {
  const {
    initClient,
    isSidebarOpen,
    isInspectorOpen,
    rightPanelMode,
    isTerminalDrawerOpen,
    openCommandPalette,
    openNewThreadModal,
    openSettings,
    toggleSidebar,
    toggleInspector,
    toggleTerminalDrawer,
    toggleModelPicker,
  } = useAppStore();

  // Initialize connection to Go server daemon
  useEffect(() => {
    initClient();
  }, [initClient]);

  // Desktop global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openNewThreadModal();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleInspector();
      } else if (isCmdOrCtrl && e.key === '`') {
        e.preventDefault();
        toggleTerminalDrawer();
      } else if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleModelPicker();
      } else if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        openSettings();
      }
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [openCommandPalette, openNewThreadModal, openSettings, toggleSidebar, toggleInspector, toggleTerminalDrawer, toggleModelPicker]);

  return (
    <View style={styles.container}>
      {/* 1. Left Column: Full-height Threads Sidebar */}
      {isSidebarOpen && <Sidebar />}

      {/* 2. Main Workspace: Header + Center Stage + Inspector */}
      <View style={styles.mainWorkspace}>
        {/* Workspace Titlebar & Header */}
        <WorkspaceHeader />

        {/* Content Row: Chat/Composer/Terminal & Inspector */}
        <View style={styles.workspaceBody}>
          {/* Center Column: Transcript, Floating Composer & Terminal Drawer */}
          <View style={styles.centerStage}>
            <ChatView />
            {isInspectorOpen && rightPanelMode === 'workspace' && <Inspector />}
            <Composer />
            {isTerminalDrawerOpen && <TerminalDrawer />}
          </View>

          {/* Right Column: Docked Inspector (Diff Panel) */}
          {isInspectorOpen && rightPanelMode === 'diffs' && <Inspector />}
        </View>
      </View>

      {/* Modals & Full Stage Overlays */}
      <CommandPalette />
      <SettingsView />
      <NewThreadModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mainWorkspace: {
    flex: 1,
    height: '100%',
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  workspaceBody: {
    flex: 1,
    height: '100%',
    minHeight: 0,
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  centerStage: {
    flex: 1,
    height: '100%',
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
});
