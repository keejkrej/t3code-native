import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Button } from '../ui/Button';

export const TerminalView: React.FC = () => {
  const { terminalLines, executeTerminalCommand, clearTerminal } = useAppStore();
  const [cmdInput, setCmdInput] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [terminalLines.length]);

  const handleSubmit = () => {
    if (!cmdInput.trim()) return;
    executeTerminalCommand(cmdInput.trim());
    setCmdInput('');
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const runPreset = (cmd: string) => {
    executeTerminalCommand(cmd);
  };

  return (
    <View style={styles.container}>
      {/* Quick shortcuts toolbar */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
          <View style={styles.presetsRow}>
            {['git status', 'pnpm test', 'pnpm build', 'ls -la'].map((cmd) => (
              <Pressable
                key={cmd}
                style={styles.presetChip}
                onPress={() => runPreset(cmd)}
              >
                <Text style={styles.presetText}>{cmd}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <Button
          icon="Trash2"
          label="Clear"
          variant="ghost"
          size="xs"
          onPress={clearTerminal}
        />
      </View>

      {/* Terminal log output */}
      <ScrollView
        ref={scrollRef}
        style={styles.terminalOutput}
        contentContainerStyle={styles.outputContent}
        showsVerticalScrollIndicator={true}
      >
        {terminalLines.map((line) => {
          if (line.type === 'system') {
            return (
              <Text key={line.id} style={styles.systemLine} selectable>
                [system] {line.text}
              </Text>
            );
          }
          if (line.type === 'input') {
            return (
              <View key={line.id} style={styles.inputRow}>
                <Text style={styles.promptSign}>t3code $</Text>
                <Text style={styles.inputCommandText} selectable>
                  {line.text}
                </Text>
              </View>
            );
          }
          return (
            <Text
              key={line.id}
              style={[styles.outputLine, line.type === 'error' && styles.errorLine]}
              selectable
            >
              {line.text}
            </Text>
          );
        })}
      </ScrollView>

      {/* Terminal Prompt Input */}
      <View style={styles.promptFooter}>
        <Text style={styles.promptSign}>t3code $</Text>
        <TextInput
          placeholder="Execute shell command..."
          placeholderTextColor={colors.textMuted}
          value={cmdInput}
          onChangeText={setCmdInput}
          // @ts-ignore
          onKeyDown={handleKeyDown}
          style={styles.promptInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          icon="Play"
          variant="ghost"
          size="xs"
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080a',
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  presetsScroll: {
    flex: 1,
    marginRight: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  terminalOutput: {
    flex: 1,
    padding: spacing.md,
  },
  outputContent: {
    gap: 4,
    paddingBottom: 16,
  },
  systemLine: {
    color: colors.accentBlue,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  promptSign: {
    color: colors.accentEmerald,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  inputCommandText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    fontWeight: typography.weights.medium,
  },
  outputLine: {
    color: '#d1d5db',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    lineHeight: 18,
  },
  errorLine: {
    color: colors.accentRose,
  },
  promptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    gap: 8,
  },
  promptInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    padding: 0,
    // @ts-ignore
    outlineWidth: 0,
  },
});
