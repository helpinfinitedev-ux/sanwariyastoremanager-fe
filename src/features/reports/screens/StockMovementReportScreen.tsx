import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from '@/web/primitives';
import { useNavigation } from '@/web/navigation';
import { useStockMovementAnalyticsQuery } from '../hooks/useStoreReports';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import KpiCard from '../../../shared/components/ui/KpiCard';
import ReportChart from '../components/ReportChart';
import ExportButton from '../components/ExportButton';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import DatePicker from '../../../shared/components/ui/DatePicker';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { formatNumber } from '../../../shared/utils/formatters';

export const StockMovementReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data, isLoading, isError, refetch } = useStockMovementAnalyticsQuery({ startDate, endDate });

  const columns: Column<any>[] = [
    { key: 'movementType', title: 'Movement Ledger Type', flex: 2 },
    {
      key: 'quantity',
      title: 'Net Cumulative Units',
      flex: 1.5,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatNumber(item.quantity, 2)}
        </Text>
      ),
    },
    {
      key: 'count',
      title: 'Transaction Entries',
      flex: 1.2,
      align: 'right',
      render: (item) => <Text style={{ color: colors.textSecondary }}>{item.count}</Text>,
    },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Stock Movement Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Auditing stock movement ledger...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Stock Movement Report">
        <PageHeader title="Stock Movement Report" onBack={() => navigation.goBack()} />
        <ErrorState message="Could not audit stock movements analytics." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  const chartData = (data.byMovementType || []).map((m) => ({
    label: m.movementType.replace('_', ' '),
    value: m.quantity,
  }));

  return (
    <ScreenContainer title="Stock Movement Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title="Stock Movement Ledger Analytics"
          subtitle="Audit complete inventory flow across restocking, kitchen dispatches, waste, and adjustments"
          onBack={() => navigation.goBack()}
        >
          <ExportButton reportName="Stock Movement Audit Report" />
        </PageHeader>

        {/* Date Filter Panel */}
        <Card style={styles.filterCard}>
          <View style={styles.filterRow}>
            <View style={styles.filterCol}>
              <DatePicker label="Reporting Start Date" value={startDate} onChange={setStartDate} />
            </View>
            <View style={styles.filterCol}>
              <DatePicker label="Reporting End Date" value={endDate} onChange={setEndDate} />
            </View>
          </View>
        </Card>

        {/* KPIs Strip */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Total Ledger Movements"
              value={String(data.summary?.totalMovements || 0)}
              iconName="swap-horizontal-outline"
              iconColor={colors.primary}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Total IN Units"
              value={formatNumber(data.summary?.totalInQuantity || 0, 2)}
              iconName="arrow-down-circle-outline"
              iconColor={colors.success}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Total OUT Units"
              value={formatNumber(data.summary?.totalOutQuantity || 0, 2)}
              iconName="arrow-up-circle-outline"
              iconColor={colors.danger}
            />
          </View>
        </View>

        {/* Chart Card */}
        <Card>
          <ReportChart
            data={chartData}
            title="Material Flux Volume by Movement Type"
            type="number"
          />
        </Card>

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Movement Class Breakdown</Text>
          <View style={styles.tableWrapper}>
            <DataTable data={data.byMovementType || []} columns={columns} loading={false} />
          </View>
        </Card>
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
  filterCard: {
    padding: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  filterCol: {
    flex: 1,
    minWidth: 200,
    paddingHorizontal: spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  kpiItem: {
    flex: 1,
    minWidth: 200,
    padding: spacing.xs,
    boxSizing: 'border-box' as any,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  tableCard: {
    padding: spacing.md,
  },
  tableWrapper: {
    minHeight: 250,
  },
});

export default StockMovementReportScreen;
