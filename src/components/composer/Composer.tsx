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
import { ProviderLogo } from '../ui/ProviderLogo';
import { ContextChip } from '../../types';
import { ModelPickerPopover } from './ModelPickerPopover';

export const Composer: React.FC = () => {
  const {
    activeThreadId,
    messages,
    sendMessage,
    isGenerating,
    cancelGeneration,
    selectedProvider,
    selectedModel,
    isModelPickerOpen,
    openModelPicker,
    closeModelPicker,
    toggleModelPicker,
    providers,
    projects,
    activeProjectId,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [contextChips, setContextChips] = useState<ContextChip[]>([]);

  const activeProvider = providers.find((p) => p.id === selectedProvider);
  const activeModelObj = activeProvider?.models.find((m) => m.id === selectedModel);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];
  const isDraftHero = threadMessages.length === 0;

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    sendMessage(input.trim(), contextChips.length > 0 ? contextChips : undefined);
    setInput('');
    setContextChips([]);
  };

  const handleKeyDown = (e: any) => {
    const key = e?.nativeEvent?.key || e?.key;
    const shift = e?.shiftKey || e?.nativeEvent?.shiftKey;
    if (key === 'Enter' && !shift) {
      if (typeof e?.preventDefault === 'function') e.preventDefault();
      handleSend();
    }
  };

  const removeChip = (id: string) => {
    setContextChips(contextChips.filter((c) => c.id !== id));
  };

  const canSubmit = input.trim().length > 0 && !isGenerating;

  return (
    <View style={styles.floatingWrapper}>
      {/* Anchored Model Picker Popover */}
      {isModelPickerOpen && (
        <>
          <Pressable style={styles.popoverBackdrop} onPress={closeModelPicker} />
          <View style={styles.popoverAnchor}>
            <ModelPickerPopover onClose={closeModelPicker} />
          </View>
        </>
      )}

      {/* 1. Main Composer Elevated Card */}
      <View style={styles.composerCard}>
        {/* Context chips bar if any are active */}
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
              : 'Ask for changes, send follow-ups, or attach images'
          }
          placeholderTextColor="#71717a"
          value={input}
          onChangeText={setInput}
          onKeyPress={handleKeyDown}
          onSubmitEditing={handleSend}
          editable={!isGenerating}
          style={styles.textInput}
        />

        {/* Bottom Controls Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            {/* Model Selector Pill */}
            <Pressable
              style={({ pressed }: any) => [
                styles.modelPill,
                pressed && styles.pillHover,
                isModelPickerOpen && styles.modelPillActive,
              ]}
              onPress={toggleModelPicker}
              title="Switch AI model (Ctrl+Shift+M)"
            >
              <View style={styles.modelProvBadge}>
                <ProviderLogo
                  provider={(activeProvider as any)?.driverKind || selectedProvider}
                  size={14}
                />
              </View>
              <Text style={styles.modelNameText}>
                {activeModelObj?.name || selectedModel}
              </Text>
              <Icon
                name="ChevronDown"
                size={11}
                color={isModelPickerOpen ? colors.primary : '#71717a'}
              />
            </Pressable>

            <View style={styles.verticalDivider} />

            {/* Permissions Selector Pill */}
            <Pressable
              style={({ pressed }: any) => [styles.permissionsPill, pressed && styles.pillHover]}
            >
              <Icon name="Lock" size={11} color="#71717a" />
              <Text style={styles.permissionsText}>Full access</Text>
              <Icon name="ChevronDown" size={11} color="#71717a" />
            </Pressable>
          </View>

          <View style={styles.bottomRight}>
            {/* Paperclip attachment button */}
            <Pressable
              style={({ pressed }: any) => [styles.attachBtn, pressed && styles.attachBtnHover]}
              title="Attach files"
            >
              <Icon name="Paperclip" size={15} color="#71717a" />
            </Pressable>

            {/* Circular Blue Send Button */}
            {isGenerating ? (
              <Pressable style={styles.stopButton} onPress={cancelGeneration} title="Stop agent">
                <Icon name="Square" size={12} color="#ffffff" />
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.sendButton,
                  !canSubmit && styles.sendButtonDisabled,
                ]}
                disabled={!canSubmit}
                onPress={handleSend}
                title="Submit message"
              >
                <Icon
                  name="ArrowUp"
                  size={15}
                  color="#ffffff"
                  strokeWidth={2.4}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* 2. Underhanging Drawer Context Strip (Shown on Draft Hero state like OG T3 Code) */}
      {isDraftHero && (
        <View style={styles.contextStrip}>
          <Pressable style={styles.trayPill}>
            <Icon name="Folder" size={11} color="#818181" />
            <Text style={styles.trayPillText}>Current checkout</Text>
            <Icon name="ChevronDown" size={10} color="#71717a" />
          </Pressable>

          <Pressable style={styles.trayPill}>
            <Icon name="GitBranch" size={11} color="#818181" />
            <Text style={styles.trayPillText}>{activeProject?.branch || 'main'}</Text>
            <Icon name="ChevronDown" size={10} color="#71717a" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    width: '100%',
    maxWidth: 736,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 10,
    position: 'relative',
  },
  composerCard: {
    backgroundColor: '#111215',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.75,
    shadowRadius: 28,
    elevation: 10,
    zIndex: 10,
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
    backgroundColor: '#191b22',
    borderWidth: 1,
    borderColor: '#262934',
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
    minHeight: 50,
    maxHeight: 180,
    color: '#f5f5f5',
    fontSize: 14.5,
    fontFamily: typography.fontFamily,
    lineHeight: 22,
    padding: 0,
    textAlignVertical: 'top',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popoverBackdrop: {
    position: 'absolute',
    top: -3000,
    left: -3000,
    right: -3000,
    bottom: -3000,
    zIndex: 9998,
  },
  popoverAnchor: {
    position: 'absolute',
    bottom: 58,
    left: 12,
    zIndex: 9999,
  },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 6,
    transition: 'background-color 0.15s ease' as any,
  },
  modelPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  modelProvBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  modelProvBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: typography.monoFontFamily,
  },
  permissionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 5,
    transition: 'background-color 0.15s ease' as any,
  },
  pillHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modelNameText: {
    color: '#d4d4d8',
    fontSize: 12,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#27272a',
    marginHorizontal: 2,
  },
  permissionsText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontFamily: typography.fontFamily,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    transition: 'background-color 0.15s ease' as any,
  },
  attachBtnHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#346bf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.64,
  },
  stopButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Underhanging Drawer Context Strip
  contextStrip: {
    alignSelf: 'center',
    width: '92%',
    marginTop: -14,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 18,
    paddingBottom: 5,
    paddingHorizontal: 12,
    backgroundColor: '#0c0d10',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  trayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#14151b',
    borderWidth: 1,
    borderColor: '#22242c',
    gap: 5,
  },
  trayPillText: {
    color: '#818181',
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
});
