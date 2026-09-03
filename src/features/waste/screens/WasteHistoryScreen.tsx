import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWasteHistory } from '../hooks/useWaste';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import TableToolbar from '../../../shared/components/table/TableToolbar';
import Drawer from '../../../shared/components/ui/Drawer';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import { WasteEntry } from '../../../shared/mock/mockDb';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/constants/routes';
import { WasteStackParamList } from '../../../app/navigation/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';

type NavigationProp = NativeStackNavigationProp<WasteStackParamList>;

export const WasteHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 400);

  const [reason, setReason] = useState<'Expired' | 'Spoiled' | 'Damaged' | 'Overproduction' | 'Other' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Drawer item
  const [selectedWaste, setSelectedWaste] = useState<WasteEntry | null>(null);

  const { data, isLoading } = useWasteHistory({
    page,
    pageSize,
    search: debouncedSearch,
    reason,
    startDate,
    endDate,
  });

  const hasActiveFilters = !!(reason || startDate || endDate);

  const handleClearFilters = () => {
    setReason('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

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

  const columns: Column<WasteEntry>[] = [
    {
      key: 'date',
      title: 'Log Date',
      flex: 1.3,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date, 'MMM DD, YYYY')}</Text>,
    },
    { key: 'productName', title: 'Ingredient Product', flex: 2.2 },
    {
      key: 'quantity',
      title: 'Qty Lost',
      flex: 1.1,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {item.quantity} {item.unit}
        </Text>
      ),
    },
    {
      key: 'reason',
      title: 'Waste Reason',
      flex: 1.3,
      align: 'center',
      render: (item) => (
        <Badge
          label={item.reason}
          type={getReasonBadgeType(item.reason)}
        />
      ),
    },
    {
      key: 'valueLost',
      title: 'Value Lost',
      flex: 1.2,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.danger }}>
          {formatCurrency(item.valueLost)}
        </Text>
      ),
    },
  ];

  const reasonOptions = [
    { label: 'All Reasons', value: '' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Spoiled', value: 'Spoiled' },
    { label: 'Damaged', value: 'Damaged' },
    { label: 'Overproduction', value: 'Overproduction' },
    { label: 'Other', value: 'Other' },
  ];

  return (
    <ScreenContainer title="Logged Store Waste">
      <View style={styles.content}>
        <PageHeader
          title="Waste Ledger & Spoilage"
          subtitle="Record and audit ingredient losses, expired items, and kitchen shrinkage"
          primaryAction={{
            title: 'Log Spoilage Waste',
            onPress: () => navigation.navigate(ROUTES.WASTE_SCREENS.CREATE as any),
          }}
        />

        <TableToolbar
          searchValue={searchValue}
          onSearchChange={(val) => {
            setSearchValue(val);
            setPage(1);
          }}
          searchPlaceholder="Search product or notes..."
          filterOpen={filtersOpen}
          onToggleFilter={() => setFiltersOpen(!filtersOpen)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        {filtersOpen && (
          <View style={[styles.filterPanel, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
            <View style={styles.filterRow}>
              <View style={styles.filterCol}>
                <Select
                  label="Waste Reason Category"
                  options={reasonOptions}
                  selectedValue={reason}
                  onValueChange={(val) => { setReason(val as any); setPage(1); }}
                />
              </View>
              <View style={styles.filterCol}>
                <DatePicker
                  label="From Date"
                  value={startDate}
                  onChange={(d) => { setStartDate(d); setPage(1); }}
                />
              </View>
              <View style={styles.filterCol}>
                <DatePicker
                  label="To Date"
                  value={endDate}
                  onChange={(d) => { setEndDate(d); setPage(1); }}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.tableWrapper}>
          <DataTable
            data={data?.data || []}
            columns={columns}
            loading={isLoading}
            onRowPress={(item) => setSelectedWaste(item)}
            emptyText="No waste logs found."
          />
        </View>

        <TablePagination
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount || 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </View>

      {/* Detail Slide Drawer */}
      <Drawer
        visible={!!selectedWaste}
        onClose={() => setSelectedWaste(null)}
        title={`Waste Log details: ${selectedWaste?.id}`}
      >
        {selectedWaste && (
          <View style={styles.drawerDetails}>
            <View style={styles.drawerSummary}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Product / Material</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '600' }]}>
                  {selectedWaste.productName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Disposed Qty</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedWaste.quantity} {selectedWaste.unit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reason Category</Text>
                <Badge
                  label={selectedWaste.reason}
                  type={getReasonBadgeType(selectedWaste.reason)}
                />
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Estimated Cost Loss</Text>
                <Text style={[styles.detailValue, { color: colors.danger, fontWeight: '700' }]}>
                  {formatCurrency(selectedWaste.valueLost)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Logged Date</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(selectedWaste.date)}</Text>
              </View>
            </View>

            {selectedWaste.notes ? (
              <View style={styles.notesBox}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes / Remarks</Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{selectedWaste.notes}</Text>
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={{ gap: spacing.sm }}>
              <Button
                title="View Full Waste Record"
                onPress={() => {
                  const wasteId = selectedWaste.id;
                  setSelectedWaste(null);
                  navigation.navigate(ROUTES.WASTE_SCREENS.DETAILS as any, { id: wasteId });
                }}
              />
              <Button
                title="Close Panel"
                onPress={() => setSelectedWaste(null)}
                variant="outline"
              />
            </View>
          </View>
        )}
      </Drawer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    flex: 1,
  },
  filterPanel: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  filterCol: {
    flex: 1,
    minWidth: 180,
  },
  tableWrapper: {
    flex: 1,
    marginTop: spacing.sm,
  },
  drawerDetails: {
    gap: spacing.md,
  },
  drawerSummary: {
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
  detailValue: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  notesBox: {
    marginTop: spacing.sm,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default WasteHistoryScreen;
