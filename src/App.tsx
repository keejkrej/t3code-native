import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from './theme';
import { useAppStore } from './state/useAppStore';
import { DesktopHeader } from './components/layout/DesktopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { Inspector } from './components/layout/Inspector';
import { ChatView } from './components/chat/ChatView';
import { Composer } from './components/composer/Composer';
import { CommandPalette } from './components/modals/CommandPalette';
import { SettingsModal } from './components/modals/SettingsModal';
import { NewThreadModal } from './components/modals/NewThreadModal';
import { ModelPickerModal } from './components/composer/ModelPickerModal';

export const App: React.FC = () => {
  const {
    isSidebarOpen,
    isInspectorOpen,
    openCommandPalette,
    openNewThreadModal,
    openSettings,
    toggleSidebar,
    toggleInspector,
  } = useAppStore();

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
      } else if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        openSettings();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [openCommandPalette, openNewThreadModal, openSettings, toggleSidebar, toggleInspector]);

  return (
    <View style={styles.container}>
      {/* Desktop Window Title & Header */}
      <DesktopHeader />

      {/* Main Multi-Column Workspace */}
      <View style={styles.workspace}>
        {/* Left Column: Projects & Threads Sidebar */}
        {isSidebarOpen && <Sidebar />}

        {/* Center Column: Transcript & Prompt Composer */}
        <View style={styles.centerStage}>
          <ChatView />
          <Composer />
        </View>

        {/* Right Column: Inspector (Diffs, Terminal, Files, Checkpoints) */}
        {isInspectorOpen && <Inspector />}
      </View>

      {/* Modals & Overlays */}
      <CommandPalette />
      <SettingsModal />
      <NewThreadModal />
      <ModelPickerModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  centerStage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
