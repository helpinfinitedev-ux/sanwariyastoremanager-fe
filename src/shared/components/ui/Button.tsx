import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';

import { Ionicons } from '@/web/icons';

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'small';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const { colors, theme } = useTheme();

  const getStyles = () => {
    let buttonStyle: ViewStyle = {};
    let textStyle: TextStyle = { fontWeight: '600' };
    let indicatorColor = '#FFFFFF';

    // Size styling
    switch (size) {
      case 'small':
      case 'sm':
        buttonStyle.paddingVertical = spacing.xs;
        buttonStyle.paddingHorizontal = spacing.sm;
        buttonStyle.borderRadius = 4;
        textStyle.fontSize = 12;
        break;
      case 'lg':
        buttonStyle.paddingVertical = spacing.md;
        buttonStyle.paddingHorizontal = spacing.xl;
        buttonStyle.borderRadius = 8;
        textStyle.fontSize = 16;
        break;
      case 'md':
      default:
        buttonStyle.paddingVertical = spacing.sm;
        buttonStyle.paddingHorizontal = spacing.lg;
        buttonStyle.borderRadius = 6;
        textStyle.fontSize = 14;
        break;
    }

    // Variant styling
    switch (variant) {
      case 'secondary':
        buttonStyle.backgroundColor = colors.surfaceHover;
        buttonStyle.borderWidth = 1;
        buttonStyle.borderColor = colors.border;
        textStyle.color = colors.textSecondary;
        indicatorColor = colors.textSecondary;
        break;
      case 'outline':
        buttonStyle.backgroundColor = 'transparent';
        buttonStyle.borderWidth = 1;
        buttonStyle.borderColor = colors.border;
        textStyle.color = colors.text;
        indicatorColor = colors.text;
        break;
      case 'danger':
        buttonStyle.backgroundColor = colors.danger;
        textStyle.color = '#FFFFFF';
        indicatorColor = '#FFFFFF';
        break;
      case 'ghost':
        buttonStyle.backgroundColor = 'transparent';
        textStyle.color = colors.text;
        indicatorColor = colors.text;
        break;
      case 'primary':
      default:
        buttonStyle.backgroundColor = colors.primary;
        textStyle.color = theme === 'dark' ? '#0F172A' : '#FFFFFF';
        indicatorColor = theme === 'dark' ? '#0F172A' : '#FFFFFF';
        break;
    }

    if (disabled || loading) {
      buttonStyle.opacity = 0.5;
    }

    return { buttonStyle, textStyle, indicatorColor };
  };

  const { buttonStyle, textStyle, indicatorColor } = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.base, buttonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon as any}
              size={size === 'sm' || size === 'small' ? 14 : 16}
              color={textStyle.color as string}
              style={{ marginRight: 6 }}
            />
          )}
          {title ? (
            <Text style={textStyle}>{title}</Text>
          ) : typeof children === 'string' ? (
            <Text style={textStyle}>{children}</Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
});

export default Button;
