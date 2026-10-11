import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon, IconName } from '../ui/Icon';
import { ProviderLogo } from '../ui/ProviderLogo';
import { ProviderId, ModelInfo } from '../../types';

interface ModelPickerPopoverProps {
  onClose: () => void;
}

export const ModelPickerPopover: React.FC<ModelPickerPopoverProps> = ({ onClose }) => {
  const {
    providers,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    modelFavorites,
    hiddenModels,
    toggleModelFavorite,
    openSettings,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<string>(() => {
    // If user has favorites, default to favorites tab, else current provider
    return modelFavorites.length > 0 ? 'favorites' : selectedProvider;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLegacyExpanded, setIsLegacyExpanded] = useState(false);
  const searchInputRef = useRef<any>(null);


  // Keyboard navigation & number jump (1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Check number keys 1-9 for quick jump if not actively typing text search
      if (/^[1-9]$/.test(e.key) && (!searchQuery || e.altKey || e.ctrlKey)) {
        const index = parseInt(e.key, 10) - 1;
        if (visibleModels[index]) {
          e.preventDefault();
          handleSelectModel(visibleModels[index].providerId, visibleModels[index].model.id);
        }
      }
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  });

  const handleSelectModel = (providerId: string, modelId: string) => {
    setSelectedProvider(providerId as ProviderId);
    setSelectedModel(modelId);
    onClose();
  };

  // Build flattened model lists based on active tab and search query
  const allModelsWithProvider = useMemo(() => {
    const list: Array<{
      providerId: string;
      driverKind: string;
      providerName: string;
      badge: string;
      iconColor: string;
      model: ModelInfo;
    }> = [];
    providers.forEach((prov) => {
      if (!prov.isEnabled) return;
      prov.models.forEach((m) => {
        list.push({
          providerId: prov.id,
          driverKind: (prov as any).driverKind || prov.id,
          providerName: prov.displayName || prov.name,
          badge: prov.badge,
          iconColor: prov.iconColor,
          model: m,
        });
      });
    });
    return list;
  }, [providers]);

  // Models matching current filter / tab
  const { visibleModels, legacyModels } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      // Global search across all providers
      const matches = allModelsWithProvider.filter(({ model, providerName }) => {
        return (
          model.name.toLowerCase().includes(q) ||
          model.id.toLowerCase().includes(q) ||
          model.description.toLowerCase().includes(q) ||
          providerName.toLowerCase().includes(q)
        );
      });
      return {
        visibleModels: matches.filter((m) => !m.model.isLegacy),
        legacyModels: matches.filter((m) => m.model.isLegacy),
      };
    }

    if (activeTab === 'favorites') {
      const favList = allModelsWithProvider.filter(({ providerId, model }) =>
        modelFavorites.includes(`${providerId}:${model.id}`)
      );
      return {
        visibleModels: favList,
        legacyModels: [],
      };
    }

    // Specific provider
    const prov = providers.find((p) => p.id === activeTab);
    if (!prov) return { visibleModels: [], legacyModels: [] };

    const provModels = prov.models.map((m) => ({
      providerId: prov.id,
      driverKind: (prov as any).driverKind || prov.id,
      providerName: prov.displayName || prov.name,
      badge: prov.badge,
      iconColor: prov.iconColor,
      model: m,
    }));

    return {
      visibleModels: provModels.filter((m) => !m.model.isLegacy),
      legacyModels: provModels.filter((m) => m.model.isLegacy),
    };
  }, [allModelsWithProvider, providers, activeTab, searchQuery, modelFavorites]);

  const favoritesCount = modelFavorites.length;

  return (
    <View style={styles.popoverContainer}>
      {/* 1. Left Vertical Rail (ModelPickerSidebar) */}
      <View style={styles.sidebarRail}>
        {/* Favorites button */}
        <Pressable
          style={[styles.railButton, activeTab === 'favorites' && styles.activeRailButton]}
          onPress={() => setActiveTab('favorites')}
          title="Favorites"
        >
          <Icon
            name="Star"
            size={16}
            color={activeTab === 'favorites' ? '#eab308' : colors.textMuted}
          />
          {activeTab === 'favorites' && <View style={styles.activeIndicator} />}
        </Pressable>

        <View style={styles.railDivider} />

        {/* Provider Buttons */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.railList}>
          {providers.map((prov) => {
            const isActive = activeTab === prov.id;
            return (
              <Pressable
                key={prov.id}
                style={[styles.railButton, isActive && styles.activeRailButton]}
                onPress={() => setActiveTab(prov.id)}
                title={prov.displayName || prov.name}
              >
                <View
                  style={[
                    styles.provGlyph,
                    isActive && styles.activeProvGlyph,
                  ]}
                >
                  <ProviderLogo provider={prov.driverKind || prov.id} size={18} />
                </View>
                {isActive && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Settings shortcut at bottom of rail */}
        <Pressable
          style={styles.railSettingsBtn}
          onPress={() => {
            onClose();
            openSettings('providers');
          }}
          title="Configure Providers in Settings"
        >
          <Icon name="Settings" size={14} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* 2. Right Main Area */}
      <View style={styles.mainContent}>
        {/* Top Search Input */}
        <View style={styles.searchBar}>
          <Icon name="Search" size={14} color={colors.textMuted} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search models..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <Icon name="X" size={12} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Model Rows */}
        <ScrollView style={styles.modelScrollView} showsVerticalScrollIndicator={false}>
          {visibleModels.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'favorites'
                  ? 'No favorite models yet'
                  : 'No models found'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {activeTab === 'favorites'
                  ? 'Star any model in the list to pin it to your favorites.'
                  : 'Try searching for another keyword or check provider settings.'}
              </Text>
            </View>
          )}

          {visibleModels.map((item, index) => {
            const isSelected =
              item.providerId === selectedProvider && item.model.id === selectedModel;
            const isFav = modelFavorites.includes(`${item.providerId}:${item.model.id}`);
            const jumpNumber = index < 9 ? index + 1 : null;

            return (
              <Pressable
                key={`${item.providerId}-${item.model.id}`}
                style={[styles.modelRow, isSelected && styles.selectedModelRow]}
                onPress={() => handleSelectModel(item.providerId, item.model.id)}
              >
                {/* Left: Model Name, Badges & Sub-Provider */}
                <View style={styles.modelRowInfo}>
                  <View style={styles.modelRowTop}>
                    <Text
                      style={[styles.modelRowTitle, isSelected && styles.selectedModelRowTitle]}
                      numberOfLines={1}
                    >
                      {item.model.name}
                    </Text>

                    {item.model.badge === 'new' && (
                      <View style={styles.badgeNew}>
                        <Text style={styles.badgeNewText}>NEW</Text>
                      </View>
                    )}
                    {item.model.badge === 'reasoning' && (
                      <View style={styles.badgeReasoning}>
                        <Text style={styles.badgeReasoningText}>REASONING</Text>
                      </View>
                    )}
                    {item.model.capabilities?.includes('Thinking') && !item.model.badge && (
                      <View style={styles.badgeThinking}>
                        <Text style={styles.badgeThinkingText}>THINKING</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modelRowBottom}>
                    <ProviderLogo
                      provider={item.driverKind || item.providerId}
                      size={12}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.subProvText} numberOfLines={1}>
                      {item.providerName}
                      {item.model.subProvider ? ` · ${item.model.subProvider}` : ''}
                      {item.model.contextWindow ? ` · ${item.model.contextWindow}` : ''}
                    </Text>
                  </View>
                </View>

                {/* Right: Quick Jump Keycap, Star Toggle & Selected Check */}
                <View style={styles.modelRowActions}>
                  {jumpNumber && (
                    <View style={styles.jumpKbd}>
                      <Text style={styles.jumpKbdText}>{jumpNumber}</Text>
                    </View>
                  )}

                  <Pressable
                    style={styles.starBtn}
                    onPress={(e: any) => {
                      e.stopPropagation();
                      toggleModelFavorite(item.providerId, item.model.id);
                    }}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Icon
                      name="Star"
                      size={13}
                      color={isFav ? '#eab308' : '#52525b'}
                    />
                  </Pressable>

                  {isSelected && (
                    <View style={styles.checkIconWrapper}>
                      <Icon name="Check" size={14} color={colors.primary} />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}

          {/* Legacy Models Collapsible Section */}
          {legacyModels.length > 0 && (
            <View style={styles.legacySection}>
              <Pressable
                style={styles.legacyHeader}
                onPress={() => setIsLegacyExpanded(!isLegacyExpanded)}
              >
                <View style={styles.legacyHeaderLeft}>
                  <Text style={styles.legacyTitle}>Legacy models</Text>
                  <Text style={styles.legacyCount}>
                    {legacyModels.length} {legacyModels.length === 1 ? 'model' : 'models'}
                  </Text>
                </View>
                <Icon
                  name={isLegacyExpanded ? 'ChevronDown' : 'ChevronRight'}
                  size={14}
                  color={colors.textMuted}
                />
              </Pressable>

              {isLegacyExpanded && (
                <View style={styles.legacyList}>
                  {legacyModels.map((item) => {
                    const isSelected =
                      item.providerId === selectedProvider && item.model.id === selectedModel;
                    const isFav = modelFavorites.includes(`${item.providerId}:${item.model.id}`);

                    return (
                      <Pressable
                        key={`${item.providerId}-${item.model.id}`}
                        style={[styles.modelRow, styles.legacyModelRow, isSelected && styles.selectedModelRow]}
                        onPress={() => handleSelectModel(item.providerId, item.model.id)}
                      >
                        <View style={styles.modelRowInfo}>
                          <Text
                            style={[styles.modelRowTitle, isSelected && styles.selectedModelRowTitle]}
                            numberOfLines={1}
                          >
                            {item.model.name}
                          </Text>
                          <Text style={styles.subProvText} numberOfLines={1}>
                            {item.providerName} · Legacy
                          </Text>
                        </View>

                        <View style={styles.modelRowActions}>
                          <Pressable
                            style={styles.starBtn}
                            onPress={(e: any) => {
                              e.stopPropagation();
                              toggleModelFavorite(item.providerId, item.model.id);
                            }}
                          >
                            <Icon
                              name="Star"
                              size={13}
                              color={isFav ? '#eab308' : '#52525b'}
                            />
                          </Pressable>
                          {isSelected && <Icon name="Check" size={14} color={colors.primary} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  popoverContainer: {
    width: 480,
    height: 380,
    backgroundColor: '#111113',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 20,
  },
  sidebarRail: {
    width: 46,
    backgroundColor: '#0c0c0e',
    borderRightWidth: 1,
    borderRightColor: '#222225',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  railButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeRailButton: {
    backgroundColor: '#1e1e24',
  },
  activeIndicator: {
    position: 'absolute',
    right: -5,
    top: 9,
    width: 3,
    height: 18,
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  railDivider: {
    width: 28,
    height: 1,
    backgroundColor: '#222225',
    marginVertical: 4,
  },
  railList: {
    flex: 1,
    width: '100%',
  },
  provGlyph: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProvGlyph: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  provGlyphText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.monoFontFamily,
  },
  railSettingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#111113',
    flexDirection: 'column',
  },
  searchBar: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222225',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    color: '#f4f4f5',
    fontSize: 13,
    fontFamily: typography.fontFamily,
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  modelScrollView: {
    flex: 1,
    padding: 6,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    color: '#71717a',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    marginVertical: 1,
  },
  selectedModelRow: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  modelRowInfo: {
    flex: 1,
    marginRight: 8,
  },
  modelRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelRowTitle: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  selectedModelRowTitle: {
    color: '#ffffff',
    fontWeight: '600',
  },
  badgeNew: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    borderWidth: 1,
    borderRadius: 3,
  },
  badgeNewText: {
    color: '#22d3ee',
    fontSize: 8,
    fontWeight: '800',
    fontFamily: typography.monoFontFamily,
  },
  badgeReasoning: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 1,
    borderRadius: 3,
  },
  badgeReasoningText: {
    color: '#c084fc',
    fontSize: 8,
    fontWeight: '800',
    fontFamily: typography.monoFontFamily,
  },
  badgeThinking: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
    borderRadius: 3,
  },
  badgeThinkingText: {
    color: '#fbbf24',
    fontSize: 8,
    fontWeight: '800',
    fontFamily: typography.monoFontFamily,
  },
  modelRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  subProvDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subProvText: {
    color: '#71717a',
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  modelRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jumpKbd: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 4,
  },
  jumpKbdText: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: typography.monoFontFamily,
  },
  starBtn: {
    padding: 4,
    borderRadius: 4,
  },
  checkIconWrapper: {
    marginLeft: 2,
  },
  legacySection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f1f23',
    paddingTop: 6,
  },
  legacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  legacyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legacyTitle: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  legacyCount: {
    color: '#52525b',
    fontSize: 11,
  },
  legacyList: {
    paddingLeft: 4,
  },
  legacyModelRow: {
    opacity: 0.85,
  },
});
