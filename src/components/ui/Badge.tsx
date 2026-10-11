import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'sm',
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'danger':
        return styles.danger;
      case 'purple':
        return styles.purple;
      case 'outline':
        return styles.outline;
      default:
        return styles.default;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'danger':
        return styles.dangerText;
      case 'purple':
        return styles.purpleText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.defaultText;
    }
  };

  return (
    <View style={[styles.badge, size === 'sm' ? styles.sizeSm : styles.sizeMd, getBadgeStyle(), style]}>
      <Text style={[styles.text, size === 'sm' ? styles.textSm : styles.textMd, getTextStyle(), textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sizeMd: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
  textMd: {
    fontSize: typography.sizes.sm,
  },
  default: {
    backgroundColor: colors.surfaceHover,
  },
  defaultText: {
    color: colors.textSecondary,
  },
  primary: {
    backgroundColor: colors.primaryMuted,
  },
  primaryText: {
    color: colors.primary,
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  successText: {
    color: colors.accentEmerald,
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  warningText: {
    color: colors.accentAmber,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  dangerText: {
    color: colors.accentRose,
  },
  purple: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  purpleText: {
    color: colors.antigravity,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineText: {
    color: colors.textSecondary,
  },
});
