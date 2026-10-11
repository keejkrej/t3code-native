import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { Icon } from '../ui/Icon';

interface ThinkingAccordionProps {
  thoughts: string;
  isStreaming?: boolean;
}

export const ThinkingAccordion: React.FC<ThinkingAccordionProps> = ({
  thoughts,
  isStreaming = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thoughts) return null;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.pulseDot, isStreaming && styles.pulseDotActive]} />
          <Icon name="Sparkles" size={13} color={colors.accentPurple} />
          <Text style={styles.title}>
            {isStreaming ? 'Thinking...' : 'Reasoning process'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.toggleHint}>{isExpanded ? 'Hide' : 'Show details'}</Text>
          <Icon
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={13}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.thoughtText} selectable>
            {thoughts}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentPurple,
    opacity: 0.5,
  },
  pulseDotActive: {
    opacity: 1,
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleHint: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  thoughtText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    lineHeight: 18,
  },
});
