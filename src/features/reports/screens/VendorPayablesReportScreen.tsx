import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVendorPayablesAnalyticsQuery } from '../hooks/useStoreReports';
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
import { formatCurrency } from '../../../shared/utils/formatters';

export const VendorPayablesReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const { data, isLoading, isError, refetch } = useVendorPayablesAnalyticsQuery();

  const columns: Column<any>[] = [
    { key: 'vendorName', title: 'Supplier Partner', flex: 2 },
    { key: 'contactPerson', title: 'Contact Person', flex: 1.5 },
    { key: 'phone', title: 'Phone Number', flex: 1.5 },
    {
      key: 'totalPurchases',
      title: 'Gross Purchases',
      flex: 1.5,
      align: 'right',
      render: (item) => <Text style={{ color: colors.text }}>{formatCurrency(item.totalPurchases)}</Text>,
    },
    {
      key: 'totalPayments',
      title: 'Settled Paid',
      flex: 1.5,
      align: 'right',
      render: (item) => <Text style={{ color: colors.success }}>{formatCurrency(item.totalPayments)}</Text>,
    },
    {
      key: 'outstanding',
      title: 'Balance Due',
      flex: 1.5,
      align: 'right',
      render: (item) => (
        <Text
          style={{
            fontWeight: '700',
            color: item.outstanding > 0 ? colors.danger : colors.textSecondary,
          }}
        >
          {formatCurrency(item.outstanding)}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ScreenContainer title="Vendor Payables Report">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Calculating vendor outstanding ledger balances...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer title="Vendor Payables Report">
        <PageHeader title="Vendor Payables" onBack={() => navigation.goBack()} />
        <ErrorState message="Could not compile vendor payables analytics." onRetry={refetch} />
      </ScreenContainer>
    );
  }

  const chartData = (data.vendors || [])
    .filter((v) => v.outstanding > 0)
    .slice(0, 7)
    .map((v) => ({
      label: v.vendorName.length > 12 ? v.vendorName.slice(0, 10) + '..' : v.vendorName,
      value: v.outstanding,
    }));

  return (
    <ScreenContainer title="Vendor Payables Report">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title="Supplier Payables & Balance Due"
          subtitle="Audit procurement invoices, settled payment vouchers, and FIFO outstanding liabilities"
          onBack={() => navigation.goBack()}
        >
          <ExportButton reportName="Vendor Payables Report" />
        </PageHeader>

        {/* KPIs Strip */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Gross Procurement"
              value={formatCurrency(data.summary?.totalPurchases || 0)}
              iconName="cart-outline"
              iconColor={colors.primary}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Settled Disbursements"
              value={formatCurrency(data.summary?.totalPayments || 0)}
              iconName="checkmark-circle-outline"
              iconColor={colors.success}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Total Outstanding Due"
              value={formatCurrency(data.summary?.totalOutstanding || 0)}
              iconName="alert-circle-outline"
              iconColor={colors.danger}
            />
          </View>
          <View style={styles.kpiItem}>
            <KpiCard
              title="Active Vendor Count"
              value={String(data.summary?.activeVendorsCount || 0)}
              iconName="people-outline"
              iconColor={colors.info}
            />
          </View>
        </View>

        {/* Chart Card */}
        {chartData.length > 0 && (
          <Card>
            <ReportChart
              data={chartData}
              title="Top Outstanding Liabilities by Supplier"
              type="currency"
            />
          </Card>
        )}

        {/* Detail Table */}
        <Card style={styles.tableCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Supplier FIFO Balance Ledger</Text>
          <View style={styles.tableWrapper}>
            <DataTable data={data.vendors || []} columns={columns} loading={false} />
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

export default VendorPayablesReportScreen;
