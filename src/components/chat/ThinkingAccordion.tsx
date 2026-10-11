import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';
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
        style={({ pressed }: any) => [styles.header, pressed && styles.headerHover]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <Icon
            name="Brain"
            size={13}
            color={isStreaming ? colors.primaryLight : '#818181'}
          />
          <Text style={styles.title}>
            {isStreaming ? 'Thinking...' : 'Reasoning process'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Icon
            name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
            size={12}
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
    width: '100%',
    marginVertical: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s ease' as any,
  },
  headerHover: {
    backgroundColor: '#131313',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#818181',
    fontSize: 13,
    fontWeight: typography.weights.normal,
    fontFamily: typography.fontFamily,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingLeft: 29,
    paddingRight: 10,
    paddingVertical: 6,
  },
  thoughtText: {
    color: '#909095',
    fontSize: 13,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
  },
});
