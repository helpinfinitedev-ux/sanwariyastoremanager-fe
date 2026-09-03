import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useExpenseAnalyticsQuery } from '../hooks/useStoreReports';
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

export const ExpenseReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data, isLoading, isError, refetch } = useExpenseAnalyticsQuery({ startDate, endDate });

  const columns: Column<any>[] = [
    {
      key: 'date',
      title: 'Expense Date',
      flex: 1.5,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date, 'MMM DD, YYYY')}</Text>,
    },
    { key: 'category', title: 'Category', flex: 1.8 },
    {
      key: 'amount',
      title: 'Amount',
      flex: 1.3,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatCurrency(item.amount)}
        </Text>
      ),
    },
    { key: 'paymentMethod', title: 'Payment Method', flex: 1.5 },
    { key: 'description', title: 'Description', flex: 2.2 },
    { key: 'recordedBy', title: 'Recorded By', flex: 1.5 },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Expense Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Compiling operating expenses...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Expense Report">
        <PageHeader title="Expense Report" onBack={() => navigation.goBack()} />
        <ErrorState message="Could not compile expense analytics." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  const chartData = (data.byCategory || []).map((c) => ({
    label: c.category,
    value: c.totalAmount,
  }));

  return (
    <ScreenContainer title="Expense Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title="Operating Expense Analytics"
          subtitle="Audit non-inventory operational overheads, vendor bills, and utility spends"
          onBack={() => navigation.goBack()}
        >
          <ExportButton reportName="Operating Expense Report" />
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
              title="Total Outlay Spent"
              value={formatCurrency(data.summary?.totalExpense || 0)}
              iconName="wallet-outline"
              iconColor={colors.warning}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Expense Count"
              value={String(data.summary?.expenseCount || 0)}
              iconName="receipt-outline"
              iconColor={colors.info}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Average Expense Rate"
              value={formatCurrency(data.summary?.avgExpense || 0)}
              iconName="calculator-outline"
              iconColor={colors.primary}
            />
          </View>
        </View>

        {/* Chart Card */}
        <Card>
          <ReportChart
            data={chartData}
            title="Expenses Distribution by Category"
            type="currency"
          />
        </Card>

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Itemized Expense Records</Text>
          <View style={styles.tableWrapper}>
            <DataTable data={data.tableData || []} columns={columns} loading={false} />
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

export default ExpenseReportScreen;
