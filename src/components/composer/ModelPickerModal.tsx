import React from 'react';
import { StyleSheet, View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';

export const ModelPickerModal: React.FC = () => {
  const {
    isModelPickerOpen,
    closeModelPicker,
    providers,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
  } = useAppStore();

  if (!isModelPickerOpen) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isModelPickerOpen}
      onRequestClose={closeModelPicker}
    >
      <Pressable style={styles.backdrop} onPress={closeModelPicker}>
        <Pressable style={styles.container} onPress={(e: any) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="Cpu" size={16} color={colors.primary} />
              <Text style={styles.headerTitle}>Select Provider & Model</Text>
            </View>
            <Pressable onPress={closeModelPicker} style={styles.closeBtn}>
              <Icon name="X" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {providers.map((prov) => {
              const isProvActive = prov.id === selectedProvider;

              return (
                <View key={prov.id} style={styles.providerSection}>
                  <View style={styles.providerHeader}>
                    <View
                      style={[
                        styles.providerBadge,
                        { backgroundColor: `${prov.iconColor}25` },
                      ]}
                    >
                      <Text style={[styles.providerBadgeText, { color: prov.iconColor }]}>
                        {prov.badge}
                      </Text>
                    </View>
                    <Text style={styles.providerName}>{prov.name}</Text>
                    {prov.authStatus === 'authenticated' ? (
                      <Badge label="Ready" variant="success" size="sm" />
                    ) : (
                      <Badge label="Setup Required" variant="outline" size="sm" />
                    )}
                  </View>

                  <View style={styles.modelsList}>
                    {prov.models.map((model) => {
                      const isSelected = isProvActive && model.id === selectedModel;

                      return (
                        <Pressable
                          key={model.id}
                          style={[
                            styles.modelItem,
                            isSelected && styles.selectedModelItem,
                          ]}
                          onPress={() => {
                            setSelectedProvider(prov.id);
                            setSelectedModel(model.id);
                            closeModelPicker();
                          }}
                        >
                          <View style={styles.modelInfo}>
                            <View style={styles.modelNameRow}>
                              <Text
                                style={[
                                  styles.modelTitle,
                                  isSelected && styles.selectedModelTitle,
                                ]}
                              >
                                {model.name}
                              </Text>
                              {model.isDefault && (
                                <Badge label="Default" variant="default" size="sm" />
                              )}
                            </View>
                            <Text style={styles.modelDesc}>{model.description}</Text>
                          </View>

                          {isSelected && (
                            <Icon name="Check" size={15} color={colors.primary} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
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
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
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
  headerTitleRow: {
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
  closeBtn: {
    padding: 4,
    borderRadius: borderRadius.xs,
  },
  content: {
    padding: spacing.md,
  },
  providerSection: {
    marginBottom: spacing.md,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  providerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  providerBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  providerName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  modelsList: {
    gap: 4,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedModelItem: {
    backgroundColor: colors.surfaceSelected,
    borderColor: colors.primaryMuted,
  },
  modelInfo: {
    flex: 1,
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  modelTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  selectedModelTitle: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  modelDesc: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
