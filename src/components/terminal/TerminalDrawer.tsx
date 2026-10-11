import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';

export const TerminalDrawer: React.FC = () => {
  const {
    terminalLines,
    executeTerminalCommand,
    clearTerminal,
    toggleTerminalDrawer,
    projects,
    activeProjectId,
  } = useAppStore();

  const [inputCommand, setInputCommand] = useState('');
  const scrollRef = useRef<any>(null);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [terminalLines.length]);

  const handleCommandSubmit = () => {
    if (!inputCommand.trim()) return;
    executeTerminalCommand(inputCommand.trim());
    setInputCommand('');
  };

  const shortPath = activeProject?.path ? activeProject.path.replace(/\/home\/[^/]+/, '~') : '~/workspace';

  return (
    <View style={styles.container}>
      {/* Terminal Titlebar */}
      <View style={styles.titlebar}>
        <View style={styles.leftInfo}>
          <Text style={styles.promptPath}>{shortPath}</Text>
          <Text style={styles.promptBranch}>{activeProject?.branch || 'main'}</Text>
          <Text style={styles.promptSymbol}>❯</Text>
        </View>

        <View style={styles.rightActions}>
          <Pressable style={styles.actionBtn} onPress={clearTerminal} title="Clear terminal">
            <Icon name="Trash2" size={13} color={colors.textMuted} />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={toggleTerminalDrawer} title="Close terminal drawer">
            <Icon name="X" size={13} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Terminal Output */}
      <ScrollView
        ref={scrollRef}
        style={styles.terminalBody}
        contentContainerStyle={styles.terminalContent}
        showsVerticalScrollIndicator={true}
      >
        {terminalLines.map((line) => (
          <View key={line.id} style={styles.line}>
            {line.type === 'input' ? (
              <View style={styles.inputLine}>
                <Text style={styles.promptPrefix}>$</Text>
                <Text style={styles.inputText}>{line.text}</Text>
              </View>
            ) : line.type === 'error' ? (
              <Text style={styles.errorText}>{line.text}</Text>
            ) : line.type === 'system' ? (
              <Text style={styles.systemText}>{line.text}</Text>
            ) : (
              <Text style={styles.outputText}>{line.text}</Text>
            )}
          </View>
        ))}

        {/* Active Input Line */}
        <View style={styles.activeInputRow}>
          <Text style={styles.activePromptPrefix}>$</Text>
          <TextInput
            style={styles.terminalInput}
            value={inputCommand}
            onChangeText={setInputCommand}
            onSubmitEditing={handleCommandSubmit}
            placeholder="Type command..."
            placeholderTextColor="#52525b"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'column',
  },
  titlebar: {
    height: 32,
    backgroundColor: '#08080a',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptPath: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  promptBranch: {
    color: '#34d399',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  promptSymbol: {
    color: '#a1a1aa',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
    borderRadius: borderRadius.xs,
  },
  terminalBody: {
    flex: 1,
    backgroundColor: '#000000',
  },
  terminalContent: {
    padding: spacing.sm,
    gap: 3,
  },
  line: {
    flexDirection: 'row',
  },
  inputLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptPrefix: {
    color: colors.primaryLight,
    fontFamily: typography.monoFontFamily,
    fontSize: 12,
  },
  inputText: {
    color: colors.text,
    fontFamily: typography.monoFontFamily,
    fontSize: 12,
  },
  outputText: {
    color: '#d4d4d8',
    fontFamily: typography.monoFontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  systemText: {
    color: '#71717a',
    fontFamily: typography.monoFontFamily,
    fontSize: 11,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#f87171',
    fontFamily: typography.monoFontFamily,
    fontSize: 12,
  },
  activeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  activePromptPrefix: {
    color: '#34d399',
    fontFamily: typography.monoFontFamily,
    fontSize: 12,
  },
  terminalInput: {
    flex: 1,
    color: '#f4f4f5',
    fontFamily: typography.monoFontFamily,
    fontSize: 12,
    padding: 0,
    height: 20,
  },
});
