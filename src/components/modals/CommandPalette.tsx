import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon, IconName } from '../ui/Icon';

interface PaletteItem {
  id: string;
  category: 'ACTIONS' | 'CONVERSATIONS' | 'FILES';
  title: string;
  subtitle?: string;
  icon: IconName;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    threads,
    setActiveThread,
    openNewThreadModal,
    openSettings,
    toggleSidebar,
    toggleInspector,
    setInspectorTab,
  } = useAppStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actionsList: PaletteItem[] = [
    {
      id: 'action-new-thread',
      category: 'ACTIONS',
      title: 'New Conversation',
      subtitle: 'Create a new thread with selected model',
      icon: 'Plus',
      shortcut: 'Ctrl N',
      action: () => {
        closeCommandPalette();
        openNewThreadModal();
      },
    },
    {
      id: 'action-toggle-diffs',
      category: 'ACTIONS',
      title: 'Open Git Changes',
      subtitle: 'Inspect modified files and stage commits',
      icon: 'FileCode',
      shortcut: 'Ctrl D',
      action: () => {
        closeCommandPalette();
        setInspectorTab('diffs');
      },
    },
    {
      id: 'action-toggle-terminal',
      category: 'ACTIONS',
      title: 'Open Terminal',
      subtitle: 'Run commands in workspace shell',
      icon: 'Terminal',
      shortcut: 'Ctrl `',
      action: () => {
        closeCommandPalette();
        setInspectorTab('terminal');
      },
    },
    {
      id: 'action-toggle-sidebar',
      category: 'ACTIONS',
      title: 'Toggle Sidebar',
      subtitle: 'Show/hide conversations and projects panel',
      icon: 'Sidebar',
      shortcut: 'Ctrl B',
      action: () => {
        closeCommandPalette();
        toggleSidebar();
      },
    },
    {
      id: 'action-open-settings',
      category: 'ACTIONS',
      title: 'Open Settings',
      subtitle: 'Configure providers, appearance, and server',
      icon: 'Settings',
      shortcut: 'Ctrl ,',
      action: () => {
        closeCommandPalette();
        openSettings();
      },
    },
  ];

  const threadItems: PaletteItem[] = threads.map((t) => ({
    id: `thread-${t.id}`,
    category: 'CONVERSATIONS',
    title: t.title,
    subtitle: `${t.provider} • ${t.model}`,
    icon: 'Sparkles',
    action: () => {
      closeCommandPalette();
      setActiveThread(t.id);
    },
  }));

  const allItems = [...actionsList, ...threadItems];
  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isCommandPaletteOpen}
      onRequestClose={closeCommandPalette}
    >
      <Pressable style={styles.backdrop} onPress={closeCommandPalette}>
        <Pressable style={styles.palette} onPress={(e: any) => e.stopPropagation()}>
          {/* Search Header */}
          <View style={styles.inputHeader}>
            <Icon name="Search" size={16} color={colors.primary} />
            <TextInput
              autoFocus
              placeholder="Type a command or search conversations..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
            <Pressable onPress={closeCommandPalette} style={styles.escPill}>
              <Text style={styles.escText}>ESC</Text>
            </Pressable>
          </View>

          {/* Results List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.itemRow}
                onPress={item.action}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.itemIconCircle}>
                    <Icon name={item.icon} size={13} color={colors.textSecondary} />
                  </View>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>

                {item.shortcut && (
                  <View style={styles.shortcutPill}>
                    <Text style={styles.shortcutText}>{item.shortcut}</Text>
                  </View>
                )}
              </Pressable>
            ))}

            {filteredItems.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No matching commands or threads</Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    paddingTop: 80,
  },
  palette: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    padding: 0,
  },
  escPill: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  escText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  list: {
    maxHeight: 380,
    padding: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemIconCircle: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  itemSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  shortcutPill: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shortcutText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  noResults: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
});
