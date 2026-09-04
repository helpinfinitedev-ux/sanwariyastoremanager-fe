import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  type = 'default',
  style,
}) => {
  const { colors } = useTheme();

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.successBg,
          color: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningBg,
          color: colors.warning,
        };
      case 'danger':
        return {
          backgroundColor: colors.dangerBg,
          color: colors.danger,
        };
      case 'info':
        return {
          backgroundColor: colors.infoBg,
          color: colors.info,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surfaceHover,
          color: colors.textSecondary,
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: currentStyles.backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, { color: currentStyles.color }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 9999,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default Badge;
