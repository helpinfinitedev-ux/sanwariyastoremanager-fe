import React from 'react';
import { View, Text, StyleSheet } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import Button from '../ui/Button';
import { Ionicons } from '@/web/icons';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An error occurred while loading data.',
  onRetry,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: colors.dangerBg }]}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        Failed to load
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message}
      </Text>
      <Button
        title="Retry Connection"
        onPress={onRetry}
        variant="primary"
        size="sm"
        style={styles.actionBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    padding: spacing.md,
    borderRadius: 9999,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  actionBtn: {
    minWidth: 140,
  },
});

export default ErrorState;
