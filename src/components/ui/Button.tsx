import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle, View, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';
import { Icon, IconName } from './Icon';

interface ButtonProps {
  label?: string;
  icon?: IconName;
  iconRight?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  iconRight,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  iconColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getContainerStyle = (): any[] => {
    let base: any = styles.secondary;
    if (variant === 'primary') base = styles.primary;
    if (variant === 'ghost') base = styles.ghost;
    if (variant === 'danger') base = styles.danger;
    if (variant === 'outline') base = styles.outline;

    let hover: any = {};
    if (isHovered && !disabled) {
      if (variant === 'primary') hover = styles.primaryHover;
      else if (variant === 'secondary') hover = styles.secondaryHover;
      else if (variant === 'ghost') hover = styles.ghostHover;
      else if (variant === 'danger') hover = styles.dangerHover;
      else if (variant === 'outline') hover = styles.outlineHover;
    }

    let pressed: any = {};
    if (isPressed && !disabled) {
      pressed = { opacity: 0.85 };
    }

    return [base, hover, pressed];
  };

  const getTextStyle = () => {
    if (variant === 'primary') return styles.primaryText;
    if (variant === 'danger') return styles.dangerText;
    if (variant === 'ghost') return styles.ghostText;
    return styles.secondaryText;
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (variant === 'primary') return '#ffffff';
    if (variant === 'danger') return colors.accentRose;
    return colors.textSecondary;
  };

  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 15;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      // @ts-ignore: React Native Web hover props
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.button,
        styles[`size_${size}` as keyof typeof styles] as ViewStyle,
        ...getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <View style={label ? styles.iconLeft : undefined}>
              <Icon name={icon} size={iconSize} color={getIconColor()} />
            </View>
          )}
          {label && (
            <Text
              style={[
                styles.label,
                styles[`label_${size}` as keyof typeof styles] as TextStyle,
                getTextStyle(),
                textStyle,
              ]}
            >
              {label}
            </Text>
          )}
          {iconRight && (
            <View style={label ? styles.iconRight : undefined}>
              <Icon name={iconRight} size={iconSize} color={getIconColor()} />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  disabled: {
    opacity: 0.45,
  },

  // Sizes
  size_xs: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  size_md: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  size_lg: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  label_xs: {
    fontSize: typography.sizes.xs,
  },
  label_sm: {
    fontSize: typography.sizes.sm,
  },
  label_md: {
    fontSize: typography.sizes.base,
  },
  label_lg: {
    fontSize: typography.sizes.md,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  primaryHover: {
    backgroundColor: colors.primaryDark,
  },
  primaryText: {
    color: '#ffffff',
  },

  secondary: {
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryHover: {
    backgroundColor: colors.surfaceActive,
    borderColor: colors.borderHighlight,
  },
  secondaryText: {
    color: colors.text,
  },

  ghost: {
    backgroundColor: 'transparent',
  },
  ghostHover: {
    backgroundColor: colors.surfaceHover,
  },
  ghostText: {
    color: colors.textSecondary,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineHover: {
    backgroundColor: colors.surfaceHover,
    borderColor: colors.borderHighlight,
  },

  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerHover: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  dangerText: {
    color: colors.accentRose,
  },
});
