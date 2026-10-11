import React, { useState } from 'react';
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
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type SettingsTab = 'general' | 'providers' | 'server' | 'keybindings';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    settings,
    updateSettings,
    providers,
    environments,
    currentEnvironmentId,
    connectionStatus,
    connectToServer,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [serverUrlInput, setServerUrlInput] = useState(settings.serverUrl);

  if (!isSettingsOpen) return null;

  const currentEnv = environments.find((e) => e.id === currentEnvironmentId);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isSettingsOpen}
      onRequestClose={closeSettings}
    >
      <Pressable style={styles.backdrop} onPress={closeSettings}>
        <Pressable style={styles.modal} onPress={(e: any) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="Settings" size={16} color={colors.primary} />
              <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <Button
              icon="X"
              variant="ghost"
              size="xs"
              onPress={closeSettings}
            />
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Left Nav */}
            <View style={styles.navColumn}>
              {[
                { id: 'general', label: 'General', icon: 'Cpu' },
                { id: 'providers', label: 'AI Providers', icon: 'Sparkles' },
                { id: 'server', label: 'Server & Sync', icon: 'Server' },
                { id: 'keybindings', label: 'Keybindings', icon: 'Command' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    style={[styles.navItem, isActive && styles.activeNavItem]}
                    onPress={() => setActiveTab(tab.id as SettingsTab)}
                  >
                    <Icon
                      name={tab.icon as IconName}
                      size={14}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[styles.navItemText, isActive && styles.activeNavItemText]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Right Content */}
            <ScrollView style={styles.contentColumn} showsVerticalScrollIndicator={false}>
              {/* General Tab */}
              {activeTab === 'general' && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>APPEARANCE & RUNTIME</Text>

                  <View style={styles.settingRow}>
                    <View style={styles.settingMeta}>
                      <Text style={styles.settingTitle}>Theme</Text>
                      <Text style={styles.settingSub}>
                        T3 Code native visual aesthetics
                      </Text>
                    </View>
                    <View style={styles.optionsRow}>
                      {['dark', 'midnight'].map((t) => (
                        <Pressable
                          key={t}
                          style={[
                            styles.choicePill,
                            settings.theme === t && styles.activeChoicePill,
                          ]}
                          onPress={() => updateSettings({ theme: t as any })}
                        >
                          <Text
                            style={[
                              styles.choiceText,
                              settings.theme === t && styles.activeChoiceText,
                            ]}
                          >
                            {t.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingMeta}>
                      <Text style={styles.settingTitle}>Thinking Animation</Text>
                      <Text style={styles.settingSub}>
                        Display animated pulse during reasoning
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.toggleSwitch,
                        settings.enableThinkingAnimation && styles.toggleSwitchOn,
                      ]}
                      onPress={() =>
                        updateSettings({
                          enableThinkingAnimation: !settings.enableThinkingAnimation,
                        })
                      }
                    >
                      <View
                        style={[
                          styles.toggleKnob,
                          settings.enableThinkingAnimation && styles.toggleKnobOn,
                        ]}
                      />
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Providers Tab */}
              {activeTab === 'providers' && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>SUPPORTED AI AGENTS & HARNESSES</Text>
                  <Text style={styles.sectionSub}>
                    T3 Code coordinates multiple AI coding agents across projects.
                  </Text>

                  {providers.map((prov) => (
                    <View key={prov.id} style={styles.providerCard}>
                      <View style={styles.providerCardTop}>
                        <View style={styles.provInfoLeft}>
                          <View
                            style={[
                              styles.providerTag,
                              { backgroundColor: `${prov.iconColor}20` },
                            ]}
                          >
                            <Text style={[styles.providerTagText, { color: prov.iconColor }]}>
                              {prov.badge}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.provCardName}>{prov.name}</Text>
                            <Text style={styles.provModelsList}>
                              {prov.models.map((m) => m.name).join(', ')}
                            </Text>
                          </View>
                        </View>
                        <Badge
                          label={prov.authStatus === 'authenticated' ? 'Connected' : 'Setup'}
                          variant={prov.authStatus === 'authenticated' ? 'success' : 'outline'}
                          size="sm"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Server & Sync Tab */}
              {activeTab === 'server' && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>T3 CODE SERVER ORCHESTRATOR</Text>

                  <View style={styles.serverStatusCard}>
                    <View style={styles.serverStatusHeader}>
                      <View style={styles.statusDotRow}>
                        <View
                          style={[
                            styles.dot,
                            connectionStatus === 'connected'
                              ? styles.dotOnline
                              : styles.dotOffline,
                          ]}
                        />
                        <Text style={styles.serverNameText}>
                          {currentEnv?.name || 'Local Server'}
                        </Text>
                      </View>
                      <Badge
                        label={connectionStatus.toUpperCase()}
                        variant={connectionStatus === 'connected' ? 'success' : 'danger'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.serverInfoText}>
                      Latency: {currentEnv?.latencyMs ?? 2}ms • Version {currentEnv?.version ?? '0.0.45'}
                    </Text>
                  </View>

                  <View style={styles.settingBlock}>
                    <Text style={styles.inputLabel}>WebSocket Endpoint URL</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        value={serverUrlInput}
                        onChangeText={setServerUrlInput}
                        style={styles.textInput}
                        placeholder="ws://localhost:3773/ws"
                        placeholderTextColor={colors.textMuted}
                      />
                      <Button
                        label="Connect"
                        variant="primary"
                        size="sm"
                        onPress={() => {
                          updateSettings({ serverUrl: serverUrlInput });
                          connectToServer(serverUrlInput);
                        }}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Keybindings Tab */}
              {activeTab === 'keybindings' && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>KEYBOARD SHORTCUTS</Text>

                  {[
                    { cmd: 'Command Palette', key: 'Ctrl + K' },
                    { cmd: 'New Conversation', key: 'Ctrl + N' },
                    { cmd: 'Toggle Sidebar', key: 'Ctrl + B' },
                    { cmd: 'Toggle Terminal / Diffs', key: 'Ctrl + J' },
                    { cmd: 'Send Message', key: 'Enter' },
                    { cmd: 'Newline in Composer', key: 'Shift + Enter' },
                    { cmd: 'Settings', key: 'Ctrl + ,' },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.shortcutRow}>
                      <Text style={styles.shortcutCmdText}>{item.cmd}</Text>
                      <View style={styles.keyCapsule}>
                        <Text style={styles.keyText}>{item.key}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 680,
    height: 520,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  navColumn: {
    width: 180,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    backgroundColor: colors.backgroundSubtle,
    padding: spacing.sm,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    gap: 8,
  },
  activeNavItem: {
    backgroundColor: colors.surfaceActive,
  },
  navItemText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  activeNavItemText: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  contentColumn: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeading: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  sectionSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHover,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  settingMeta: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  choicePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceActive,
  },
  activeChoicePill: {
    backgroundColor: colors.primary,
  },
  choiceText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  activeChoiceText: {
    color: '#ffffff',
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceActive,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  providerCard: {
    backgroundColor: colors.surfaceHover,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  providerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  provInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  providerTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  providerTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  provCardName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  provModelsList: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  serverStatusCard: {
    backgroundColor: colors.surfaceHover,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  serverStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: colors.accentEmerald,
  },
  dotOffline: {
    backgroundColor: colors.accentRose,
  },
  serverNameText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  serverInfoText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  settingBlock: {
    gap: 6,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 32,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    // @ts-ignore
    outlineWidth: 0,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  shortcutCmdText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  keyCapsule: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  keyText: {
    color: colors.text,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
    fontWeight: typography.weights.semibold,
  },
});
