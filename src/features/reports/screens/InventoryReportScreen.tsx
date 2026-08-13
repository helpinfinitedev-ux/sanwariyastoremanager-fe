import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useInventoryReport } from '../hooks/useReports';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import KpiCard from '../../../shared/components/ui/KpiCard';
import ReportChart from '../components/ReportChart';
import ExportButton from '../components/ExportButton';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

export const InventoryReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch } = useInventoryReport();

  const columns: Column<any>[] = [
    { key: 'sku', title: 'SKU', flex: 1.2 },
    { key: 'name', title: 'Product Name', flex: 2.2 },
    { key: 'category', title: 'Category', flex: 1.5 },
    {
      key: 'stock',
      title: 'Current Stock',
      flex: 1.2,
      align: 'right',
      render: (item) => <Text style={{ color: colors.text }}>{item.stock}</Text>,
    },
    {
      key: 'rate',
      title: 'Cost Basis Rate',
      flex: 1.2,
      align: 'right',
      render: (item) => <Text style={{ color: colors.text }}>{formatCurrency(item.rate)}</Text>,
    },
    {
      key: 'valuation',
      title: 'Valuation Sum',
      flex: 1.4,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatCurrency(item.valuation)}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Inventory Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Calculating inventory asset metrics...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Inventory Report">
        <ErrorState message="Could not compile inventory analytics report." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Inventory Asset Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader title="Inventory Asset Valuation Audit" subtitle="Audit asset holdings, safety limits, and categories allocations">
          <ExportButton reportName="Inventory Valuation Report" />
        </PageHeader>

        {/* KPIs Strip */}
        <View style={styles.kpiRow}>
          {data.kpis.map((kpi, idx) => (
            <View key={idx} style={styles.kpiItem}>
              <KpiCard
                title={kpi.label}
                value={String(kpi.value)}
                iconName={kpi.icon as any}
                iconColor={colors.primary}
              />
            </View>
          ))}
        </View>

        {/* Chart Card */}
        <Card>
          <ReportChart
            data={data.chartData}
            title="Valuation Spreads Chart (Asset total values by category)"
            type="currency"
          />
        </Card>

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Store Stock Ledger</Text>
          <View style={styles.tableWrapper}>
            <DataTable data={data.tableData} columns={columns} loading={false} />
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

export default InventoryReportScreen;
