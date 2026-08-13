import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { usePurchaseReport } from '../hooks/useReports';
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
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export const PurchaseReportScreen: React.FC = () => {
  const { colors } = useTheme();

  // Date range filters
  const [startDate, setStartDate] = useState(() => {
    // default to last 30 days
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data, isLoading, isError, refetch } = usePurchaseReport(startDate, endDate);

  const columns: Column<any>[] = [
    {
      key: 'date',
      title: 'Billing Date',
      flex: 1.5,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date, 'MMM DD, YYYY')}</Text>,
    },
    { key: 'invoiceNo', title: 'Invoice Ref', flex: 1.2 },
    { key: 'vendor', title: 'Vendor Partner', flex: 2 },
    { key: 'itemsCount', title: 'Items Count', flex: 1, align: 'center' },
    {
      key: 'amount',
      title: 'Billed Amount',
      flex: 1.3,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatCurrency(item.amount)}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Purchase Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Compiling restock financials...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Purchase Report">
        <ErrorState message="Could not compile purchases analytics." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Purchases Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader title="Restock Purchase Analytics" subtitle="Report on material inflows and spends">
          <ExportButton reportName="Restock Purchase Report" />
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
          {data.kpis.map((kpi, idx) => (
            <View key={idx} style={styles.kpiItem}>
              <KpiCard
                title={kpi.label}
                value={String(kpi.value)}
                iconName={kpi.icon as any}
                iconColor={colors.success}
              />
            </View>
          ))}
        </View>

        {/* Chart Card */}
        <Card>
          <ReportChart
            data={data.chartData}
            title="Spends Trend Chart (Billed amount by day)"
            type="currency"
          />
        </Card>

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Audit Invoices Ledger</Text>
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
  filterCard: {
    padding: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  filterCol: {
    flex: 1,
    minWidth: 200,
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

export default PurchaseReportScreen;
