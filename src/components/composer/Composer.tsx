import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { ContextChip } from '../../types';

export const Composer: React.FC = () => {
  const {
    activeThreadId,
    sendMessage,
    isGenerating,
    cancelGeneration,
    selectedProvider,
    selectedModel,
    openModelPicker,
    providers,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [contextChips, setContextChips] = useState<ContextChip[]>([]);

  const activeProvider = providers.find((p) => p.id === selectedProvider);
  const activeModelObj = activeProvider?.models.find((m) => m.id === selectedModel);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    sendMessage(input.trim(), contextChips.length > 0 ? contextChips : undefined);
    setInput('');
    setContextChips([]);
  };

  const handleKeyDown = (e: any) => {
    // If running on web / RN Web
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addChip = (type: ContextChip['type'], label: string, value: string) => {
    if (contextChips.some((c) => c.label === label)) return;
    setContextChips([...contextChips, { id: `chip-${Date.now()}`, type, label, value }]);
  };

  const removeChip = (id: string) => {
    setContextChips(contextChips.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.composerCard}>
        {/* Context chips bar */}
        {contextChips.length > 0 && (
          <View style={styles.chipsBar}>
            {contextChips.map((chip) => (
              <View key={chip.id} style={styles.chip}>
                <Icon
                  name={chip.type === 'git' ? 'GitBranch' : 'FileCode'}
                  size={12}
                  color={colors.primaryLight}
                />
                <Text style={styles.chipLabel}>{chip.label}</Text>
                <Pressable onPress={() => removeChip(chip.id)} style={styles.chipRemove}>
                  <Icon name="X" size={10} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Input Text Area */}
        <TextInput
          multiline
          placeholder={
            isGenerating
              ? 'Agent is thinking and executing...'
              : 'Direct your coding agent... (Enter to send, Shift+Enter for newline)'
          }
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          // @ts-ignore: web keyboard event
          onKeyDown={handleKeyDown}
          editable={!isGenerating}
          style={styles.textInput}
        />

        {/* Bottom Bar: Model Selector, Context Shortcuts, Action Buttons */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            {/* Model & Provider Trigger */}
            <Pressable style={styles.modelPill} onPress={openModelPicker}>
              <View
                style={[
                  styles.providerDot,
                  { backgroundColor: activeProvider?.iconColor || colors.primary },
                ]}
              />
              <Text style={styles.modelNameText}>
                {activeModelObj?.name || selectedModel}
              </Text>
              <Icon name="ChevronDown" size={12} color={colors.textMuted} />
            </Pressable>

            {/* Quick Context Adders */}
            <Pressable
              style={styles.quickAddBtn}
              onPress={() => addChip('file', 'src/App.tsx', 'src/App.tsx')}
            >
              <Text style={styles.quickAddText}>+ @App.tsx</Text>
            </Pressable>

            <Pressable
              style={styles.quickAddBtn}
              onPress={() => addChip('git', 'git:diff', 'HEAD')}
            >
              <Text style={styles.quickAddText}>+ @diff</Text>
            </Pressable>
          </View>

          <View style={styles.bottomRight}>
            {isGenerating ? (
              <Button
                label="Stop"
                icon="Square"
                variant="danger"
                size="sm"
                onPress={cancelGeneration}
              />
            ) : (
              <Button
                icon="Send"
                variant="primary"
                size="sm"
                disabled={!input.trim()}
                onPress={handleSend}
                label="Send"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
    backgroundColor: colors.background,
  },
  composerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  chipsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  chipLabel: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
  },
  chipRemove: {
    padding: 2,
  },
  textInput: {
    minHeight: 56,
    maxHeight: 180,
    color: colors.text,
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    lineHeight: 22,
    padding: 0,
    textAlignVertical: 'top',
    // @ts-ignore
    outlineWidth: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: spacing.sm,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  providerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  modelNameText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  quickAddBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceHover,
  },
  quickAddText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
