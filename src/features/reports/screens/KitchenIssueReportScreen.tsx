import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useKitchenIssueReport } from '../hooks/useReports';
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
import { formatDate } from '../../../shared/utils/formatters';

export const KitchenIssueReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data, isLoading, isError, refetch } = useKitchenIssueReport(startDate, endDate);

  const columns: Column<any>[] = [
    {
      key: 'date',
      title: 'Dispatch Date',
      flex: 1.5,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date)}</Text>,
    },
    { key: 'section', title: 'Target Section', flex: 1.8 },
    { key: 'itemsCount', title: 'Unique Products', flex: 1.2, align: 'center' },
    { key: 'itemsList', title: 'Issued Ingredients Detail', flex: 3.5, hideOnTablet: true },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Kitchen Dispatch Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Compiling kitchen dispatch statistics...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Kitchen Dispatch Report">
        <PageHeader
          title="Kitchen Dispatch Report"
          onBack={() => navigation.goBack()}
        />
        <ErrorState message="Could not compile kitchen issue report." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Kitchen Dispatch Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title="Kitchen Dispatch Analytics"
          subtitle="Report on material dispatches and section consumptions"
          onBack={() => navigation.goBack()}
        >
          <ExportButton reportName="Kitchen Dispatch Report" />
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
                iconColor={colors.info}
              />
            </View>
          ))}
        </View>

        {/* Chart Card */}
        <Card>
          <ReportChart
            data={data.chartData}
            title="Consumptions Chart (Dispatch count by kitchen section)"
            type="number"
          />
        </Card>

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dispatch Auditing History</Text>
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

export default KitchenIssueReportScreen;
