import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

export const NewThreadModal: React.FC = () => {
  const {
    isNewThreadModalOpen,
    closeNewThreadModal,
    createThread,
    providers,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
  } = useAppStore();

  const [title, setTitle] = useState('');

  if (!isNewThreadModalOpen) return null;

  const handleCreate = () => {
    if (!title.trim()) return;
    createThread(title.trim(), selectedProvider, selectedModel);
    setTitle('');
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  const activeProvider = providers.find((p) => p.id === selectedProvider);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isNewThreadModalOpen}
      onRequestClose={closeNewThreadModal}
    >
      <Pressable style={styles.backdrop} onPress={closeNewThreadModal}>
        <Pressable style={styles.modal} onPress={(e: any) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="Sparkles" size={16} color={colors.primary} />
              <Text style={styles.headerTitle}>New Conversation</Text>
            </View>
            <Button
              icon="X"
              variant="ghost"
              size="xs"
              onPress={closeNewThreadModal}
            />
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Task or Prompt</Text>
              <TextInput
                autoFocus
                placeholder="E.g., Implement dark mode diff gutter in React Native"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                // @ts-ignore
                onKeyDown={handleKeyDown}
                style={styles.textInput}
              />
            </View>

            {/* Provider and Model Choices */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>AI Coding Agent</Text>
              <View style={styles.providerGrid}>
                {providers.map((prov) => {
                  const isSelected = prov.id === selectedProvider;

                  return (
                    <Pressable
                      key={prov.id}
                      style={[
                        styles.providerPill,
                        isSelected && styles.selectedProviderPill,
                      ]}
                      onPress={() => {
                        setSelectedProvider(prov.id);
                        if (prov.models[0]) {
                          setSelectedModel(prov.models[0].id);
                        }
                      }}
                    >
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
                      <Text
                        style={[
                          styles.providerName,
                          isSelected && styles.selectedProviderName,
                        ]}
                      >
                        {prov.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Model List */}
            {activeProvider && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Model</Text>
                <View style={styles.modelsRow}>
                  {activeProvider.models.map((model) => {
                    const isSelected = model.id === selectedModel;

                    return (
                      <Pressable
                        key={model.id}
                        style={[
                          styles.modelChoice,
                          isSelected && styles.selectedModelChoice,
                        ]}
                        onPress={() => setSelectedModel(model.id)}
                      >
                        <Text
                          style={[
                            styles.modelChoiceText,
                            isSelected && styles.selectedModelChoiceText,
                          ]}
                        >
                          {model.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={closeNewThreadModal}
            />
            <Button
              label="Create Thread"
              icon="Plus"
              variant="primary"
              size="sm"
              disabled={!title.trim()}
              onPress={handleCreate}
            />
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
    maxWidth: 520,
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  textInput: {
    height: 38,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    // @ts-ignore
    outlineWidth: 0,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  providerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  selectedProviderPill: {
    backgroundColor: colors.surfaceActive,
    borderColor: colors.primary,
  },
  providerTag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  providerTagText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  providerName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  selectedProviderName: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  modelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modelChoice: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  selectedModelChoice: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  modelChoiceText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
  },
  selectedModelChoiceText: {
    color: colors.primaryLight,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: 8,
  },
});
