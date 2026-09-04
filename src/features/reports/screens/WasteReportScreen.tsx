import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from '@/web/primitives';
import { useNavigation } from '@/web/navigation';
import { useWasteReport } from '../hooks/useReports';
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

export const WasteReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  // Date range filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data, isLoading, isError, refetch } = useWasteReport(startDate, endDate);

  const columns: Column<any>[] = [
    {
      key: 'date',
      title: 'Waste Date',
      flex: 1.4,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date, 'MMM DD, YYYY')}</Text>,
    },
    { key: 'product', title: 'Product Name', flex: 2.2 },
    { key: 'qty', title: 'Qty Disposed', flex: 1.2, align: 'right' },
    { key: 'reason', title: 'Waste Reason', flex: 1.3, align: 'center' },
    {
      key: 'lostValue',
      title: 'Financial Loss',
      flex: 1.3,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.danger }}>
          {formatCurrency(item.lostValue)}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Waste Loss Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Compiling waste loss structures...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Waste Loss Report">
        <PageHeader
          title="Waste Loss Report"
          onBack={() => navigation.goBack()}
        />
        <ErrorState message="Could not compile waste report statistics." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Waste Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title="Spoilage & Waste Loss Analytics"
          subtitle="Report on material shrinkage, decay, and direct financial losses"
          onBack={() => navigation.goBack()}
        >
          <ExportButton reportName="Waste Loss Report" />
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
                iconColor={colors.danger}
              />
            </View>
          ))}
        </View>

        {/* Chart Card */}
        <Card>
          <ReportChart
            data={data.chartData}
            title="Loss Categories Chart (Financial loss by waste reason)"
            type="currency"
          />
        </Card>

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Waste Audit Ledger</Text>
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

export default WasteReportScreen;
