import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import Button from '../ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    title: string;
    onPress: () => void;
    icon?: string;
  };
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  primaryAction,
  style,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }, style]}>
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {children}
        {primaryAction && (
          <Button
            title={primaryAction.title}
            onPress={primaryAction.onPress}
            variant="primary"
            size="sm"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  leftSection: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

export default PageHeader;
