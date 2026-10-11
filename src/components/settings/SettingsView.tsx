import React, { useState, useMemo } from 'react';
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
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProviderLogo } from '../ui/ProviderLogo';
import { ProviderInfo, ModelInfo, ProviderEnvVar } from '../../types';

class SettingsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('SettingsView CRASH:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 40, backgroundColor: '#09090b', zIndex: 99999 }}>
          <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold' }}>SettingsView Render Error:</Text>
          <Text style={{ color: '#f4f4f5', marginTop: 12, fontFamily: 'monospace', fontSize: 13 }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export const SettingsView: React.FC = () => {
  return (
    <SettingsErrorBoundary>
      <SettingsViewContent />
    </SettingsErrorBoundary>
  );
};

const SettingsViewContent: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    settingsTab,
    setSettingsTab,
    selectedSettingsProviderId,
    setSelectedSettingsProviderId,
    providers,
    settings,
    updateSettings,
    environments,
    currentEnvironmentId,
    connectionStatus,
    connectToServer,
    modelFavorites,
    hiddenModels,
    toggleModelFavorite,
    toggleModelVisibility,
    updateProvider,
    addCustomModel,
    deleteCustomModel,
    addProviderInstance,
    deleteProviderInstance,
    resetProviderToDefault,
  } = useAppStore();

  const [settingsSearch, setSettingsSearch] = useState('');
  const [modelFilterQuery, setModelFilterQuery] = useState('');
  const [isAddingCustomModel, setIsAddingCustomModel] = useState(false);
  const [newModelSlug, setNewModelSlug] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelContext, setNewModelContext] = useState('128k');
  const [newModelThinking, setNewModelThinking] = useState(false);

  // Runtime Env Vars edit state
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [newEnvSensitive, setNewEnvSensitive] = useState(true);

  // Add Provider Dialog state
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvDriver, setNewProvDriver] = useState<'codex' | 'claude' | 'antigravity' | 'opencode'>('codex');

  // Active Provider in the Editor
  const currentProvider = useMemo(() => {
    return (
      providers.find((p) => p.id === selectedSettingsProviderId) ||
      providers[0] ||
      null
    );
  }, [providers, selectedSettingsProviderId]);

  if (!isSettingsOpen) return null;

  const activeTab = typeof settingsTab === 'string' ? settingsTab : 'providers';
  const currentEnv = environments.find((e) => e.id === currentEnvironmentId) || environments[0];

  const handleSaveCustomModel = () => {
    if (!newModelSlug.trim() || !newModelName.trim() || !currentProvider) return;
    addCustomModel(currentProvider.id, {
      id: newModelSlug.trim().toLowerCase(),
      name: newModelName.trim(),
      description: `Custom model definition (${newModelContext})`,
      contextWindow: `${newModelContext} tokens`,
      capabilities: newModelThinking ? ['Thinking', 'Reasoning'] : ['Fast mode'],
      isCustom: true,
    });
    setNewModelSlug('');
    setNewModelName('');
    setIsAddingCustomModel(false);
  };

  const handleAddEnvVar = () => {
    if (!newEnvKey.trim() || !currentProvider) return;
    const currentVars = currentProvider.environmentVariables || [];
    const newVar: ProviderEnvVar = {
      id: `env-${Date.now()}`,
      name: newEnvKey.trim().toUpperCase(),
      value: newEnvVal.trim(),
      sensitive: newEnvSensitive,
    };
    updateProvider(currentProvider.id, {
      environmentVariables: [...currentVars, newVar],
    });
    setNewEnvKey('');
    setNewEnvVal('');
  };

  const handleDeleteEnvVar = (varId: string) => {
    if (!currentProvider) return;
    const currentVars = currentProvider.environmentVariables || [];
    updateProvider(currentProvider.id, {
      environmentVariables: currentVars.filter((v) => v.id !== varId),
    });
  };

  const handleCreateProviderInstance = () => {
    if (!newProvName.trim()) return;
    const slug = newProvName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newProv: ProviderInfo = {
      id: slug,
      name: newProvName.trim(),
      displayName: newProvName.trim(),
      badge: newProvName.slice(0, 2).toUpperCase(),
      iconColor: '#3b82f6',
      driverKind: newProvDriver,
      version: 'v1.0.0',
      isConfigured: true,
      isEnabled: true,
      authStatus: 'authenticated',
      models: [
        {
          id: `${slug}-default`,
          name: `${newProvName} Default Model`,
          description: 'Primary model endpoint',
          isDefault: true,
        },
      ],
    };
    addProviderInstance(newProv);
    setIsAddProviderOpen(false);
    setNewProvName('');
  };

  return (
    <View style={styles.overlayContainer}>
      {/* 1. Top Workspace Header with Breadcrumb and Escape to return */}
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Pressable style={styles.backButton} onPress={closeSettings}>
            <Icon name="ChevronLeft" size={14} color={colors.textMuted} />
            <Text style={styles.backButtonText}>Back to workspace</Text>
          </Pressable>

          <View style={styles.topbarBreadcrumbSep}>
            <Text style={styles.breadcrumbSepText}>/</Text>
          </View>

          <View style={styles.breadcrumbTag}>
            <Text style={styles.breadcrumbTitle}>
              Settings <Text style={styles.breadcrumbSubtitle}>/ {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.topbarRight}>
          {activeTab === 'general' && (
            <Button
              label="Restore device defaults"
              icon="RotateCcw"
              variant="ghost"
              size="xs"
              onPress={() => {
                updateSettings({
                  theme: 'dark',
                  contrast: 50,
                  glassOpacity: 75,
                  fontSize: 13,
                  responseStreamingMode: 'streamed',
                });
              }}
            />
          )}
          <Button
            label="Done"
            variant="primary"
            size="xs"
            onPress={closeSettings}
          />
        </View>
      </View>

      {/* 2. Main Stage: Sidebar Nav + Settings Body */}
      <View style={styles.contentBody}>
        {/* Left Settings Sidebar Nav */}
        <View style={styles.sidebarNav}>
          {/* Search Box */}
          <View style={styles.navSearchBox}>
            <Icon name="Search" size={13} color={colors.textMuted} />
            <TextInput
              style={styles.navSearchInput}
              placeholder="Search settings..."
              placeholderTextColor="#71717a"
              value={settingsSearch}
              onChangeText={setSettingsSearch}
            />
          </View>

          {/* Navigation Section Items */}
          <ScrollView style={styles.navItemsList} showsVerticalScrollIndicator={false}>
            {[
              { id: 'providers', label: 'Providers', icon: 'Bot' },
              { id: 'general', label: 'General', icon: 'Settings' },
              { id: 'appearance', label: 'Appearance', icon: 'Palette' },
              { id: 'keybindings', label: 'Keybindings', icon: 'Command' },
              { id: 'projects', label: 'Projects', icon: 'Folder' },
              { id: 'connections', label: 'Connections', icon: 'Link' },
              { id: 'storage', label: 'Storage', icon: 'HardDrive' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.navItemButton, isActive && styles.activeNavItemButton]}
                  onPress={() => setSettingsTab(item.id as any)}
                >
                  <Icon
                    name={item.icon as IconName}
                    size={14}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.navItemText, isActive && styles.activeNavItemText]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={styles.navActivePill} />}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Device Summary Footer */}
          <View style={styles.sidebarFooter}>
            <View style={styles.sidebarFooterDot} />
            <Text style={styles.sidebarFooterText}>Local Arch Linux Workstation</Text>
          </View>
        </View>

        {/* Right Settings Detail Stage */}
        <View style={styles.detailPane}>
          {/* TAB 1: PROVIDERS (MASTER-DETAIL LAYOUT) */}
          {activeTab === 'providers' && (
            <View style={styles.providersMasterDetail}>
              {/* Device Selector Tabs at the Top */}
              <View style={styles.deviceTabBar}>
                <View style={styles.deviceTabActive}>
                  <Icon name="Laptop" size={13} color={colors.primary} />
                  <Text style={styles.deviceTabText}>Primary device · Local (Connected)</Text>
                  <View style={styles.statusDotGreen} />
                </View>
                <Pressable
                  style={styles.addInstanceHeaderBtn}
                  onPress={() => setIsAddProviderOpen(true)}
                >
                  <Icon name="Plus" size={13} color={colors.textMuted} />
                  <Text style={styles.addInstanceHeaderText}>Add provider</Text>
                </Pressable>
              </View>

              {/* Master-Detail 2-Column Container */}
              <View style={styles.providersTwoColumn}>
                {/* Column 1: Provider Instances List */}
                <View style={styles.providerCardsColumn}>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.cardsScroll}>
                    {providers.map((prov) => {
                      const isSelected = prov.id === selectedSettingsProviderId;
                      return (
                        <Pressable
                          key={prov.id}
                          style={[styles.provInstanceCard, isSelected && styles.provInstanceCardSelected]}
                          onPress={() => setSelectedSettingsProviderId(prov.id)}
                        >
                          <View style={styles.cardHeaderRow}>
                            <View style={styles.provCardGlyph}>
                              <ProviderLogo provider={prov.driverKind || prov.id} size={20} />
                            </View>

                            <View style={styles.cardHeaderTitles}>
                              <View style={styles.cardTitleTop}>
                                <Text style={styles.cardDisplayName} numberOfLines={1}>
                                  {prov.displayName || prov.name}
                                </Text>
                                {prov.version && (
                                  <Text style={styles.cardVersionCode}>{prov.version}</Text>
                                )}
                              </View>

                              <View style={styles.cardStatusRow}>
                                <View
                                  style={[
                                    styles.cardStatusDot,
                                    prov.isEnabled
                                      ? prov.authStatus === 'authenticated'
                                        ? styles.dotGreen
                                        : styles.dotYellow
                                      : styles.dotGray,
                                  ]}
                                />
                                <Text style={styles.cardStatusText}>
                                  {!prov.isEnabled
                                    ? 'Disabled'
                                    : prov.authStatus === 'authenticated'
                                    ? 'Ready'
                                    : 'Needs Login'}
                                </Text>
                              </View>
                            </View>

                            {/* Enable/Disable Switch */}
                            <Pressable
                              style={[
                                styles.miniSwitch,
                                prov.isEnabled && styles.miniSwitchOn,
                              ]}
                              onPress={(e: any) => {
                                e.stopPropagation();
                                updateProvider(prov.id, { isEnabled: !prov.isEnabled });
                              }}
                            >
                              <View
                                style={[
                                  styles.miniSwitchKnob,
                                  prov.isEnabled && styles.miniSwitchKnobOn,
                                ]}
                              />
                            </Pressable>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Health Check Interval Footer */}
                  <View style={styles.healthCheckFooter}>
                    <Text style={styles.healthCheckLabel}>Health check interval: 60s</Text>
                    <Pressable style={styles.checkNowBtn}>
                      <Icon name="RefreshCw" size={11} color={colors.textMuted} />
                      <Text style={styles.checkNowText}>Check now</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Column 2: Selected Provider Full Editor */}
                {currentProvider ? (
                  <ScrollView style={styles.providerEditorColumn} showsVerticalScrollIndicator={false}>
                    {/* Section 1: Header & Identity */}
                    <View style={styles.editorSectionCard}>
                      <View style={styles.editorHeaderRow}>
                        <View style={styles.editorHeaderLeft}>
                          <View style={styles.editorLargeGlyph}>
                            <ProviderLogo provider={currentProvider.driverKind || currentProvider.id} size={26} />
                          </View>
                          <View>
                            <Text style={styles.editorTitle}>{currentProvider.displayName || currentProvider.name}</Text>
                            <Text style={styles.editorSubtitle}>
                              Driver: <Text style={styles.monoKeyword}>{currentProvider.driverKind}</Text> · {currentProvider.version || 'v1.0.0'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.editorHeaderRight}>
                          <Badge
                            label={currentProvider.authStatus === 'authenticated' ? 'Connected' : 'Setup Required'}
                            variant={currentProvider.authStatus === 'authenticated' ? 'success' : 'outline'}
                            size="sm"
                          />
                          <Button
                            label="Reset to default"
                            variant="ghost"
                            size="xs"
                            onPress={() => resetProviderToDefault(currentProvider.id)}
                          />
                        </View>
                      </View>

                      {/* Display Name Input */}
                      <View style={styles.editorFieldBlock}>
                        <Text style={styles.fieldLabel}>Display Name</Text>
                        <TextInput
                          style={styles.fieldInput}
                          value={currentProvider.displayName || currentProvider.name}
                          onChangeText={(text: string) => updateProvider(currentProvider.id, { displayName: text })}
                          placeholder="Provider display name"
                          placeholderTextColor="#71717a"
                        />
                      </View>
                    </View>

                    {/* Section 2: Setup & Authentication */}
                    <View style={styles.editorSectionCard}>
                      <Text style={styles.sectionCardTitle}>Setup & Authentication</Text>

                      <View style={styles.authInfoRow}>
                        <View style={styles.authInfoLeft}>
                          <Text style={styles.fieldLabel}>Account / API Key</Text>
                          <Text style={styles.fieldSubtext}>
                            {currentProvider.authEmail
                              ? `Authenticated as ${currentProvider.authEmail}`
                              : 'API key configured for orchestration daemon'}
                          </Text>
                        </View>
                        <Badge label="Authenticated" variant="success" size="sm" />
                      </View>

                      {/* CLI Detection */}
                      <View style={styles.cliDetectRow}>
                        <View style={styles.cliDetectLeft}>
                          <Text style={styles.fieldLabel}>CLI Binary Path</Text>
                          <Text style={styles.fieldSubtext}>
                            Detected locally: <Text style={styles.monoKeyword}>{currentProvider.binaryPath || '/usr/bin/' + currentProvider.driverKind}</Text>
                          </Text>
                        </View>
                        <View style={styles.cliBadge}>
                          <Icon name="CheckCircle2" size={13} color="#22c55e" />
                          <Text style={styles.cliBadgeText}>CLI Ready</Text>
                        </View>
                      </View>

                      <TextInput
                        style={styles.fieldInput}
                        value={currentProvider.binaryPath || ''}
                        onChangeText={(val: string) => updateProvider(currentProvider.id, { binaryPath: val })}
                        placeholder={`/usr/local/bin/${currentProvider.driverKind}`}
                        placeholderTextColor="#71717a"
                      />
                    </View>

                    {/* Section 3: Runtime & Environment Variables */}
                    <View style={styles.editorSectionCard}>
                      <Text style={styles.sectionCardTitle}>Runtime & Arguments</Text>

                      <View style={styles.editorFieldBlock}>
                        <Text style={styles.fieldLabel}>CLI Arguments</Text>
                        <TextInput
                          style={styles.fieldInput}
                          value={currentProvider.cliArguments || ''}
                          onChangeText={(val: string) => updateProvider(currentProvider.id, { cliArguments: val })}
                          placeholder="--dangerously-skip-permissions --experimental-reasoning"
                          placeholderTextColor="#71717a"
                        />
                      </View>

                      {/* Environment Variables Table */}
                      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Environment Variables</Text>
                      <View style={styles.envVarsTable}>
                        {(currentProvider.environmentVariables || []).map((envVar) => (
                          <View key={envVar.id} style={styles.envVarRow}>
                            <Text style={styles.envVarName}>{envVar.name}</Text>
                            <Text style={styles.envVarValue}>{envVar.value}</Text>
                            <Pressable
                              style={styles.envVarDeleteBtn}
                              onPress={() => handleDeleteEnvVar(envVar.id)}
                            >
                              <Icon name="Trash2" size={12} color="#71717a" />
                            </Pressable>
                          </View>
                        ))}

                        {/* Add Env Var Row */}
                        <View style={styles.addEnvRow}>
                          <TextInput
                            style={[styles.addEnvInput, { flex: 1.2 }]}
                            placeholder="VARIABLE_NAME"
                            placeholderTextColor="#71717a"
                            value={newEnvKey}
                            onChangeText={setNewEnvKey}
                          />
                          <TextInput
                            style={[styles.addEnvInput, { flex: 2 }]}
                            placeholder="Value"
                            placeholderTextColor="#71717a"
                            value={newEnvVal}
                            onChangeText={setNewEnvVal}
                            secureTextEntry={newEnvSensitive}
                          />
                          <Button
                            label="Add"
                            size="xs"
                            variant="secondary"
                            onPress={handleAddEnvVar}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Section 4: Models Catalog (ProviderModelsSection) */}
                    <View style={styles.editorSectionCard}>
                      <View style={styles.modelsCatalogHeader}>
                        <View>
                          <Text style={styles.sectionCardTitle}>Models Catalog</Text>
                          <Text style={styles.fieldSubtext}>
                            Manage model visibility, favorites, and custom definitions for this provider.
                          </Text>
                        </View>

                        <Button
                          label="Add custom model"
                          icon="Plus"
                          size="xs"
                          variant="outline"
                          onPress={() => setIsAddingCustomModel(true)}
                        />
                      </View>

                      {/* Custom Model Creation Sheet */}
                      {isAddingCustomModel && (
                        <View style={styles.customModelDrawer}>
                          <Text style={styles.customModelDrawerTitle}>Add Custom Model</Text>
                          <View style={styles.customModelFieldsRow}>
                            <TextInput
                              style={[styles.fieldInput, { flex: 1 }]}
                              placeholder="Model Slug (e.g. gpt-5-custom)"
                              placeholderTextColor="#71717a"
                              value={newModelSlug}
                              onChangeText={setNewModelSlug}
                            />
                            <TextInput
                              style={[styles.fieldInput, { flex: 1 }]}
                              placeholder="Display Name"
                              placeholderTextColor="#71717a"
                              value={newModelName}
                              onChangeText={setNewModelName}
                            />
                            <TextInput
                              style={[styles.fieldInput, { width: 100 }]}
                              placeholder="Context (128k)"
                              placeholderTextColor="#71717a"
                              value={newModelContext}
                              onChangeText={setNewModelContext}
                            />
                          </View>
                          <View style={styles.customModelActions}>
                            <Button
                              label="Cancel"
                              size="xs"
                              variant="ghost"
                              onPress={() => setIsAddingCustomModel(false)}
                            />
                            <Button
                              label="Save Model"
                              size="xs"
                              variant="primary"
                              onPress={handleSaveCustomModel}
                            />
                          </View>
                        </View>
                      )}

                      {/* Models List Table */}
                      <View style={styles.modelsTable}>
                        {currentProvider.models.map((m) => {
                          const isFav = modelFavorites.includes(`${currentProvider.id}:${m.id}`);
                          const isHidden = hiddenModels.includes(`${currentProvider.id}:${m.id}`);

                          return (
                            <View key={m.id} style={styles.modelTableRow}>
                              {/* Left: Star & Name */}
                              <View style={styles.modelTableLeft}>
                                <Pressable
                                  style={styles.starPillBtn}
                                  onPress={() => toggleModelFavorite(currentProvider.id, m.id)}
                                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                  <Icon
                                    name="Star"
                                    size={13}
                                    color={isFav ? '#eab308' : '#52525b'}
                                  />
                                </Pressable>

                                <View>
                                  <View style={styles.modelNameWithBadges}>
                                    <Text style={styles.tableModelName}>{m.name}</Text>
                                    {m.badge === 'new' && (
                                      <View style={styles.tableBadgeNew}>
                                        <Text style={styles.tableBadgeNewText}>NEW</Text>
                                      </View>
                                    )}
                                    {m.isCustom && (
                                      <View style={styles.tableBadgeCustom}>
                                        <Text style={styles.tableBadgeCustomText}>CUSTOM</Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.tableModelSlug}>
                                    {m.id} {m.contextWindow ? `· ${m.contextWindow}` : ''}
                                  </Text>
                                </View>
                              </View>

                              {/* Right: Visibility Switch & Delete */}
                              <View style={styles.modelTableRight}>
                                <Text style={styles.visibilityLabel}>
                                  {isHidden ? 'Hidden' : 'Visible'}
                                </Text>
                                <Pressable
                                  style={[
                                    styles.miniSwitch,
                                    !isHidden && styles.miniSwitchOn,
                                  ]}
                                  onPress={() => toggleModelVisibility(currentProvider.id, m.id)}
                                >
                                  <View
                                    style={[
                                      styles.miniSwitchKnob,
                                      !isHidden && styles.miniSwitchKnobOn,
                                    ]}
                                  />
                                </Pressable>

                                {m.isCustom && (
                                  <Pressable
                                    style={styles.deleteModelBtn}
                                    onPress={() => deleteCustomModel(currentProvider.id, m.id)}
                                  >
                                    <Icon name="Trash2" size={12} color="#71717a" />
                                  </Pressable>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.emptyEditor}>
                    <Text style={styles.emptyEditorText}>Select a provider to configure settings</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 2: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <ScrollView style={styles.generalPane} showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>APPLICATION & VERSION</Text>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>T3 Code Native Desktop</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Version 1.0.0 (Arch Linux Omarchy · Electron 34)
                    </Text>
                  </View>
                  <Button label="Up to Date" variant="outline" size="sm" disabled />
                </View>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Update Track</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Use stable releases or experimental nightly builds.
                    </Text>
                  </View>
                  <View style={styles.segmentedControl}>
                    <Pressable style={styles.segmentedActive}>
                      <Text style={styles.segmentedActiveText}>Stable</Text>
                    </Pressable>
                    <Pressable style={styles.segmentedInactive}>
                      <Text style={styles.segmentedInactiveText}>Nightly</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>BEHAVIOR & CONVERSATIONS</Text>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Response Streaming</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Stream live tokens as they are generated by AI agents
                    </Text>
                  </View>
                  <Pressable
                    style={[
                      styles.miniSwitch,
                      settings.responseStreamingMode === 'streamed' && styles.miniSwitchOn,
                    ]}
                    onPress={() =>
                      updateSettings({
                        responseStreamingMode:
                          settings.responseStreamingMode === 'streamed' ? 'batched' : 'streamed',
                      })
                    }
                  >
                    <View
                      style={[
                        styles.miniSwitchKnob,
                        settings.responseStreamingMode === 'streamed' && styles.miniSwitchKnobOn,
                      ]}
                    />
                  </Pressable>
                </View>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Auto-Settle Inactive Threads</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Automatically archive inactive threads after 7 days
                    </Text>
                  </View>
                  <Text style={styles.valuePill}>7 days</Text>
                </View>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Confirm Thread Archive</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Show confirmation modal before archiving threads
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.miniSwitch, settings.confirmThreadArchive && styles.miniSwitchOn]}
                    onPress={() =>
                      updateSettings({ confirmThreadArchive: !settings.confirmThreadArchive })
                    }
                  >
                    <View
                      style={[
                        styles.miniSwitchKnob,
                        settings.confirmThreadArchive && styles.miniSwitchKnobOn,
                      ]}
                    />
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          )}

          {/* TAB 3: APPEARANCE SETTINGS */}
          {activeTab === 'appearance' && (
            <ScrollView style={styles.generalPane} showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>THEME & PALETTE</Text>

                <View style={styles.themeSelectorRow}>
                  {[
                    { id: 'dark', label: 'Dark', bg: '#09090b', border: '#27272a' },
                    { id: 'midnight', label: 'Midnight', bg: '#030712', border: '#1e293b' },
                    { id: 'system', label: 'System', bg: '#18181b', border: '#3f3f46' },
                  ].map((t) => {
                    const isSelected = settings.theme === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        style={[
                          styles.themeOptionCard,
                          { backgroundColor: t.bg, borderColor: t.border },
                          isSelected && styles.themeOptionCardSelected,
                        ]}
                        onPress={() => updateSettings({ theme: t.id as any })}
                      >
                        <Text style={[styles.themeOptionLabel, isSelected && styles.themeOptionLabelSelected]}>
                          {t.label}
                        </Text>
                        {isSelected && <Icon name="Check" size={14} color={colors.primary} />}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>TYPOGRAPHY & FONTS</Text>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Code Font Family</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Monospace font for diffs, codeblocks, and terminal
                    </Text>
                  </View>
                  <Text style={styles.monoKeyword}>{settings.codeFontFamily || 'JetBrains Mono'}</Text>
                </View>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Code Font Size</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Base scale for editor and diff preview
                    </Text>
                  </View>
                  <View style={styles.sizeStepper}>
                    <Pressable
                      style={styles.stepperBtn}
                      onPress={() => updateSettings({ codeFontSize: Math.max(10, settings.codeFontSize - 1) })}
                    >
                      <Icon name="Minus" size={12} color={colors.text} />
                    </Pressable>
                    <Text style={styles.stepperValue}>{settings.codeFontSize}px</Text>
                    <Pressable
                      style={styles.stepperBtn}
                      onPress={() => updateSettings({ codeFontSize: Math.min(20, settings.codeFontSize + 1) })}
                    >
                      <Icon name="Plus" size={12} color={colors.text} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          {/* TAB 4: KEYBINDINGS */}
          {activeTab === 'keybindings' && (
            <ScrollView style={styles.generalPane} showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>KEYBOARD SHORTCUTS</Text>

                {[
                  { section: 'Composer & Input', bindings: [
                    { cmd: 'Send message', key: 'Enter' },
                    { cmd: 'Newline in composer', key: 'Shift + Enter' },
                    { cmd: 'Toggle Model Picker', key: 'Ctrl + Shift + M' },
                  ]},
                  { section: 'Navigation & Stage', bindings: [
                    { cmd: 'Command Palette', key: 'Ctrl + K' },
                    { cmd: 'New Conversation Thread', key: 'Ctrl + N' },
                    { cmd: 'Toggle Left Sidebar', key: 'Ctrl + B' },
                    { cmd: 'Toggle Inspector / Diffs', key: 'Ctrl + J' },
                    { cmd: 'Toggle Terminal Drawer', key: 'Ctrl + `' },
                    { cmd: 'Open Settings', key: 'Ctrl + ,' },
                    { cmd: 'Close modal / popover', key: 'Escape' },
                  ]},
                  { section: 'Model Picker', bindings: [
                    { cmd: 'Quick jump to model 1..9', key: '1 .. 9' },
                    { cmd: 'Next provider in sidebar', key: 'Down Arrow' },
                    { cmd: 'Previous provider in sidebar', key: 'Up Arrow' },
                  ]},
                ].map((group, idx) => (
                  <View key={idx} style={styles.keybindingGroup}>
                    <Text style={styles.keybindingGroupTitle}>{group.section}</Text>
                    {group.bindings.map((b, bIdx) => (
                      <View key={bIdx} style={styles.keybindingRow}>
                        <Text style={styles.keybindingCmd}>{b.cmd}</Text>
                        <View style={styles.kbdKeycap}>
                          <Text style={styles.kbdKeycapText}>{b.key}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {/* TAB 5: CONNECTIONS */}
          {activeTab === 'connections' && (
            <ScrollView style={styles.generalPane} showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>BACKEND SERVER ORCHESTRATOR</Text>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Go Server Endpoint</Text>
                    <Text style={styles.settingLabelSubtitle}>
                      Standalone WebSocket daemon handling child agents and terminals
                    </Text>
                  </View>
                  <Badge
                    label={connectionStatus === 'connected' ? 'Connected (Port 3773)' : 'Connecting...'}
                    variant={connectionStatus === 'connected' ? 'success' : 'outline'}
                    size="sm"
                  />
                </View>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>WebSocket URI</Text>
                  </View>
                  <Text style={styles.monoKeyword}>{settings.serverUrl}</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* TAB 6: STORAGE */}
          {activeTab === 'storage' && (
            <ScrollView style={styles.generalPane} showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>LOCAL CACHE & STORAGE</Text>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Archived Conversations</Text>
                    <Text style={styles.settingLabelSubtitle}>Local checkpoints and turn states</Text>
                  </View>
                  <Text style={styles.valuePill}>14 checkpoints</Text>
                </View>

                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>Diff Cache</Text>
                    <Text style={styles.settingLabelSubtitle}>Staged and unstaged working diff files</Text>
                  </View>
                  <Button label="Clear Cache" variant="outline" size="sm" />
                </View>
              </View>
            </ScrollView>
          )}

          {/* TAB 7: PROJECTS */}
          {activeTab === 'projects' && (
            <ScrollView style={styles.generalPane} showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSectionBlock}>
                <Text style={styles.sectionBlockTitle}>ACTIVE WORKSPACES</Text>
                <View style={styles.settingSettingRow}>
                  <View style={styles.settingMetaBlock}>
                    <Text style={styles.settingLabelTitle}>t3code-native</Text>
                    <Text style={styles.settingLabelSubtitle}>/home/jack/workspace/t3code-native</Text>
                  </View>
                  <Badge label="Active" variant="success" size="sm" />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Add Provider Instance Modal */}
      {isAddProviderOpen && (
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Add Provider Instance</Text>
            <Text style={styles.dialogDesc}>
              Configure a new agent runtime instance or ACP agent endpoint.
            </Text>

            <View style={{ marginVertical: 12, gap: 10 }}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Instance Name (e.g. Codex Work)"
                placeholderTextColor="#71717a"
                value={newProvName}
                onChangeText={setNewProvName}
              />

              <View style={styles.driverPickerRow}>
                {['codex', 'claude', 'antigravity', 'opencode'].map((drv) => (
                  <Pressable
                    key={drv}
                    style={[
                      styles.driverChoicePill,
                      newProvDriver === drv && styles.driverChoicePillActive,
                    ]}
                    onPress={() => setNewProvDriver(drv as any)}
                  >
                    <Text
                      style={[
                        styles.driverChoiceText,
                        newProvDriver === drv && styles.driverChoiceTextActive,
                      ]}
                    >
                      {drv.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.dialogActions}>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => setIsAddProviderOpen(false)}
              />
              <Button
                label="Create Instance"
                variant="primary"
                size="sm"
                onPress={handleCreateProviderInstance}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 9000,
    flexDirection: 'column',
  },
  topbar: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
    backgroundColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#18181b',
    gap: 4,
  },
  backChevron: {
    transform: [{ rotate: '180deg' }],
  },
  backButtonText: {
    color: '#d4d4d8',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  topbarBreadcrumbSep: {
    marginHorizontal: 4,
  },
  breadcrumbSepText: {
    color: '#52525b',
    fontSize: 14,
  },
  breadcrumbTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbTitle: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  breadcrumbSubtitle: {
    color: '#a1a1aa',
    fontWeight: '400',
  },
  topbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentBody: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarNav: {
    width: 220,
    backgroundColor: '#09090b',
    borderRightWidth: 1,
    borderRightColor: '#1f1f23',
    flexDirection: 'column',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  navSearchBox: {
    height: 34,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
    marginBottom: 8,
  },
  navSearchInput: {
    flex: 1,
    height: 32,
    color: '#f4f4f5',
    fontSize: 12,
    padding: 0,
  },
  navItemsList: {
    flex: 1,
  },
  navItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
    marginVertical: 1,
    position: 'relative',
  },
  activeNavItemButton: {
    backgroundColor: '#18181b',
  },
  navItemText: {
    color: '#a1a1aa',
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  activeNavItemText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  navActivePill: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    backgroundColor: '#3b82f6',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sidebarFooter: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f23',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sidebarFooterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  sidebarFooterText: {
    color: '#71717a',
    fontSize: 10.5,
    fontFamily: typography.fontFamily,
  },
  detailPane: {
    flex: 1,
    backgroundColor: '#0c0c0e',
    flexDirection: 'column',
  },
  providersMasterDetail: {
    flex: 1,
    flexDirection: 'column',
  },
  deviceTabBar: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
    backgroundColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  deviceTabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceTabText: {
    color: '#f4f4f5',
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  addInstanceHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  addInstanceHeaderText: {
    color: '#d4d4d8',
    fontSize: 11.5,
    fontWeight: '500',
  },
  providersTwoColumn: {
    flex: 1,
    flexDirection: 'row',
  },
  providerCardsColumn: {
    width: 290,
    borderRightWidth: 1,
    borderRightColor: '#1f1f23',
    backgroundColor: '#0c0c0e',
    flexDirection: 'column',
  },
  cardsScroll: {
    flex: 1,
    padding: 8,
  },
  provInstanceCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#121215',
    marginBottom: 6,
  },
  provInstanceCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#161922',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  provCardGlyph: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provCardGlyphText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: typography.monoFontFamily,
  },
  cardHeaderTitles: {
    flex: 1,
  },
  cardTitleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDisplayName: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  cardVersionCode: {
    color: '#71717a',
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  cardStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotGreen: { backgroundColor: '#22c55e' },
  dotYellow: { backgroundColor: '#eab308' },
  dotGray: { backgroundColor: '#52525b' },
  cardStatusText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  miniSwitch: {
    width: 30,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#27272a',
    padding: 2,
    justifyContent: 'center',
  },
  miniSwitchOn: {
    backgroundColor: '#3b82f6',
  },
  miniSwitchKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  miniSwitchKnobOn: {
    alignSelf: 'flex-end',
  },
  healthCheckFooter: {
    height: 36,
    borderTopWidth: 1,
    borderTopColor: '#1f1f23',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#09090b',
  },
  healthCheckLabel: {
    color: '#71717a',
    fontSize: 10.5,
  },
  checkNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkNowText: {
    color: '#a1a1aa',
    fontSize: 11,
  },
  providerEditorColumn: {
    flex: 1,
    padding: 16,
  },
  editorSectionCard: {
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: '#1f1f23',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  editorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editorLargeGlyph: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorLargeGlyphText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: typography.monoFontFamily,
  },
  editorTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  editorSubtitle: {
    color: '#71717a',
    fontSize: 11.5,
    marginTop: 1,
  },
  monoKeyword: {
    fontFamily: typography.monoFontFamily,
    color: '#93c5fd',
  },
  editorHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorFieldBlock: {
    marginTop: 8,
  },
  fieldLabel: {
    color: '#d4d4d8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: typography.fontFamily,
  },
  fieldSubtext: {
    color: '#71717a',
    fontSize: 11,
    marginBottom: 6,
  },
  fieldInput: {
    height: 34,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 10,
    color: '#f4f4f5',
    fontSize: 12.5,
    fontFamily: typography.fontFamily,
  },
  sectionCardTitle: {
    color: '#f4f4f5',
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: typography.fontFamily,
  },
  authInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
    marginBottom: 10,
  },
  authInfoLeft: {
    flex: 1,
  },
  cliDetectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cliDetectLeft: {
    flex: 1,
  },
  cliBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 4,
  },
  cliBadgeText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
  },
  envVarsTable: {
    marginTop: 6,
    backgroundColor: '#0c0c0e',
    borderWidth: 1,
    borderColor: '#1f1f23',
    borderRadius: 6,
    overflow: 'hidden',
  },
  envVarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  envVarName: {
    flex: 1.2,
    color: '#d4d4d8',
    fontSize: 11.5,
    fontFamily: typography.monoFontFamily,
  },
  envVarValue: {
    flex: 2,
    color: '#71717a',
    fontSize: 11.5,
    fontFamily: typography.monoFontFamily,
  },
  envVarDeleteBtn: {
    padding: 4,
  },
  addEnvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 6,
    backgroundColor: '#141417',
  },
  addEnvInput: {
    height: 28,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 4,
    paddingHorizontal: 8,
    color: '#f4f4f5',
    fontSize: 11.5,
    fontFamily: typography.monoFontFamily,
  },
  modelsCatalogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customModelDrawer: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  customModelDrawerTitle: {
    color: '#f4f4f5',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  customModelFieldsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  customModelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  modelsTable: {
    borderWidth: 1,
    borderColor: '#1f1f23',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modelTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
    backgroundColor: '#0c0c0e',
  },
  modelTableLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  starPillBtn: {
    padding: 4,
  },
  modelNameWithBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableModelName: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '500',
  },
  tableBadgeNew: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 3,
  },
  tableBadgeNewText: {
    color: '#22d3ee',
    fontSize: 8,
    fontWeight: '800',
  },
  tableBadgeCustom: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 3,
  },
  tableBadgeCustomText: {
    color: '#c084fc',
    fontSize: 8,
    fontWeight: '800',
  },
  tableModelSlug: {
    color: '#71717a',
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  modelTableRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  visibilityLabel: {
    color: '#71717a',
    fontSize: 11,
  },
  deleteModelBtn: {
    padding: 4,
  },
  emptyEditor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEditorText: {
    color: '#71717a',
    fontSize: 13,
  },
  generalPane: {
    flex: 1,
    padding: 24,
  },
  settingsSectionBlock: {
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: '#1f1f23',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  sectionBlockTitle: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: typography.monoFontFamily,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  settingSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  settingMetaBlock: {
    flex: 1,
    marginRight: 16,
  },
  settingLabelTitle: {
    color: '#f4f4f5',
    fontSize: 13.5,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  settingLabelSubtitle: {
    color: '#71717a',
    fontSize: 11.5,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  segmentedActive: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#27272a',
    borderRadius: 5,
  },
  segmentedActiveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentedInactive: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  segmentedInactiveText: {
    color: '#71717a',
    fontSize: 12,
  },
  valuePill: {
    color: '#a1a1aa',
    fontSize: 12,
    backgroundColor: '#18181b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOptionCard: {
    flex: 1,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  themeOptionCardSelected: {
    borderColor: '#3b82f6',
  },
  themeOptionLabel: {
    color: '#a1a1aa',
    fontSize: 12.5,
    fontWeight: '600',
  },
  themeOptionLabelSelected: {
    color: '#ffffff',
  },
  sizeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    color: '#f4f4f5',
    fontSize: 12,
    fontFamily: typography.monoFontFamily,
    paddingHorizontal: 6,
  },
  keybindingGroup: {
    marginBottom: 16,
  },
  keybindingGroupTitle: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  keybindingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  keybindingCmd: {
    color: '#e4e4e7',
    fontSize: 12.5,
  },
  kbdKeycap: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  kbdKeycapText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  dialogBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dialogCard: {
    width: 420,
    backgroundColor: '#121215',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 18,
  },
  dialogTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dialogDesc: {
    color: '#71717a',
    fontSize: 12,
  },
  driverPickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  driverChoicePill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  driverChoicePillActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  driverChoiceText: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '700',
  },
  driverChoiceTextActive: {
    color: '#3b82f6',
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});
