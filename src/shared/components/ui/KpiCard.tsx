import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from '@/web/primitives';
import Card from './Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@/web/icons';

interface KpiCardProps {
  title: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  iconName,
  iconColor,
  trend,
  onPress,
}) => {
  const { colors } = useTheme();

  const content = (
    <View style={styles.cardContent}>
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {title}
        </Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend.isPositive ? colors.success : colors.danger },
              ]}
            >
              {trend.value}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.iconContainer,
          { backgroundColor: (iconColor || colors.primary) + '15' },
        ]}
      >
        <Ionicons name={iconName} size={22} color={iconColor || colors.primary} />
      </View>
    </View>
  );

  return (
    <Card 
      onPress={onPress} 
      style={[
        styles.card, 
        onPress && { cursor: 'pointer' },
        onPress && { activeOpacity: 0.9 }
      ] as any}
    >
      {content}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 200,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default KpiCard;
