import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useWasteDetails } from '../hooks/useWaste';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';
import { WasteStackParamList } from '../../../app/navigation/types';

type RoutePropType = RouteProp<WasteStackParamList, 'WasteDetails'>;

export const WasteDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const { id } = route.params;

  const { data: waste, isLoading, isError, refetch } = useWasteDetails(id);

  if (isLoading) {
    return (
      <ScreenContainer title="Waste Log Details">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading waste record...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !waste) {
    return (
      <ScreenContainer title="Waste Log Details">
        <ErrorState
          message="Could not load the requested waste entry details."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  const getReasonBadgeType = (res: string) => {
    switch (res) {
      case 'Expired':
        return 'warning' as const;
      case 'Spoiled':
        return 'danger' as const;
      case 'Damaged':
        return 'danger' as const;
      case 'Overproduction':
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <ScreenContainer title={`Waste Log: ${waste.id}`}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title={`Waste Log Details`}
          subtitle={`Auditing stock spoilage and values lost`}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.contentGrid}>
          <Card style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary Header</Text>
            
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Product / Material</Text>
                <Text style={[styles.detailVal, { color: colors.text, fontWeight: '600' }]}>{waste.productName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Quantity Disposed</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{waste.quantity} {waste.unit}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reason Category</Text>
                <Badge
                  label={waste.reason}
                  type={getReasonBadgeType(waste.reason)}
                />
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Logged Date</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{formatDate(waste.date)}</Text>
              </View>
              <View style={[styles.detailRow, styles.totalRow, { borderTopColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.text, fontWeight: '700' }]}>Estimated Value Lost</Text>
                <Text style={[styles.detailVal, { color: colors.danger, fontWeight: '700', fontSize: 16 }]}>
                  {formatCurrency(waste.valueLost)}
                </Text>
              </View>
            </View>

            {waste.notes ? (
              <View style={styles.notesSection}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes / Remarks</Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{waste.notes}</Text>
              </View>
            ) : null}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  detailsList: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 13,
  },
  notesSection: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default WasteDetailsScreen;
