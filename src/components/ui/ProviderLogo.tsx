import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PROVIDER_LOGOS } from './providerAssets';

export type KnownProviderId =
  | 'antigravity'
  | 'claude'
  | 'codex'
  | 'cursor'
  | 'grok'
  | 'opencode'
  | 'openweights'
  | 'deepmind'
  | 'anthropic'
  | 'openai'
  | 'xai';

interface ProviderLogoProps {
  provider: string;
  size?: number;
  color?: string;
  style?: any;
}

export const ProviderLogo: React.FC<ProviderLogoProps> = ({
  provider,
  size = 20,
  style,
}) => {
  const norm = (provider || '').toLowerCase().trim();

  let logoUri: string | null = null;

  if (norm === 'antigravity' || norm === 'google' || norm === 'deepmind' || norm === 'gemini') {
    logoUri = PROVIDER_LOGOS.antigravity;
  } else if (norm === 'claude' || norm === 'claudeagent' || norm === 'anthropic') {
    logoUri = PROVIDER_LOGOS.claude_ai_icon;
  } else if (norm === 'codex' || norm === 'openai' || norm === 'chatgpt') {
    logoUri = PROVIDER_LOGOS.openai_dark;
  } else if (norm === 'cursor') {
    logoUri = PROVIDER_LOGOS.cursor_light;
  } else if (norm === 'grok' || norm === 'xai') {
    logoUri = PROVIDER_LOGOS.grok_dark;
  } else if (norm === 'opencode') {
    logoUri = PROVIDER_LOGOS.opencode_dark;
  }

  if (logoUri) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Image
          source={{ uri: logoUri }}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Fallback: stylish monogram letter badge
  const letter = norm.slice(0, 2).toUpperCase() || 'AI';
  return (
    <View
      style={[
        styles.fallbackContainer,
        { width: size, height: size, borderRadius: size * 0.25 },
        style,
      ]}
    >
      <Text style={[styles.fallbackText, { fontSize: Math.max(9, size * 0.45) }]}>
        {letter}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#f4f4f5',
    fontWeight: '700',
  },
});
