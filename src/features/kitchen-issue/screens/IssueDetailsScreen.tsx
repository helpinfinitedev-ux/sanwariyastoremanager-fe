import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from '@/web/primitives';
import { useRoute, useNavigation, RouteProp } from '@/web/navigation';
import { useIssueDetails } from '../hooks/useKitchenIssues';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { formatDate } from '../../../shared/utils/formatters';
import { KitchenIssueStackParamList } from '../../../app/navigation/types';

type RoutePropType = RouteProp<KitchenIssueStackParamList, 'KitchenIssueDetails'>;

export const IssueDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const { id } = route.params;

  const { data: issue, isLoading, isError, refetch } = useIssueDetails(id);

  if (isLoading) {
    return (
      <ScreenContainer title="Dispatch Details">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading dispatch data...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !issue) {
    return (
      <ScreenContainer title="Dispatch Details">
        <ErrorState
          message="Could not load the requested dispatch record details."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title={`Dispatch: ${issue.id}`}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title={`Kitchen Dispatch: ${issue.id}`}
          subtitle={`Dispatched materials records for auditing`}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.contentGrid}>
          <Card style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary Header</Text>
            
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Recipient Section</Text>
                <Text style={[styles.detailVal, { color: colors.text, fontWeight: '600' }]}>{issue.issuedToSection}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dispatched By</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{issue.issuedBy}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date Logged</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{formatDate(issue.date)}</Text>
              </View>
            </View>

            {issue.notes ? (
              <View style={styles.notesSection}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes / Remarks</Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{issue.notes}</Text>
              </View>
            ) : null}
          </Card>

          <Card style={styles.itemsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dispatched Items</Text>
            
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
              <Text style={[styles.colName, { color: colors.textSecondary }]}>Ingredient</Text>
              <Text style={[styles.colQty, { color: colors.textSecondary }]}>Issued Qty</Text>
            </View>

            {issue.items.map((item, idx) => (
              <View key={`${item.productId}-${idx}`} style={[styles.tableRow, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.cellName, { color: colors.text }]} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={[styles.cellQty, { color: colors.text, fontWeight: '600' }]}>
                  {item.quantity}
                </Text>
              </View>
            ))}
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
  itemsCard: {
    flex: 1.5,
    minWidth: 320,
    padding: spacing.md,
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  colName: { flex: 3, fontSize: 11, fontWeight: '600' },
  colQty: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cellName: { flex: 3, fontSize: 12 },
  cellQty: { flex: 1, fontSize: 12, textAlign: 'right' },
});

export default IssueDetailsScreen;
