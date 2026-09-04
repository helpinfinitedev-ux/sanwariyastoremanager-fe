import React from 'react';
import { View, Text, StyleSheet } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import Button from '../ui/Button';
import { Ionicons } from '@/web/icons';

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  actionText,
  onAction,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: colors.surfaceHover }]}>
        <Ionicons name="document-text-outline" size={32} color={colors.textSecondary} />
      </View>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.actionBtn}
        />
      )}
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
  text: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: spacing.xs,
  },
});

export default EmptyState;
