import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from '@/web/primitives';
import { useNavigation } from '@/web/navigation';
import { useStockMovements } from '../hooks/useStockMovements';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import TableToolbar from '../../../shared/components/table/TableToolbar';
import Badge from '../../../shared/components/ui/Badge';
import Card from '../../../shared/components/ui/Card';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import { StockMovement } from '../../../shared/mock/mockDb';
import { formatNumber, formatDate } from '../../../shared/utils/formatters';
import { Ionicons } from '@/web/icons';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { ROUTES } from '../../../shared/constants/routes';

export const StockMovementScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  // View state: 'table' vs 'timeline'
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 400);

  const [type, setType] = useState<'Purchase' | 'Kitchen Issue' | 'Waste' | 'Adjustment' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useStockMovements({
    page,
    pageSize,
    search: debouncedSearch,
    type,
    startDate,
    endDate,
  });

  const hasActiveFilters = !!(type || startDate || endDate);

  const handleClearFilters = () => {
    setType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getMovementIconDetails = (mvtType: string) => {
    switch (mvtType) {
      case 'Purchase':
        return { name: 'receipt-outline' as const, color: colors.success };
      case 'Kitchen Issue':
        return { name: 'restaurant-outline' as const, color: colors.info };
      case 'Waste':
        return { name: 'trash-outline' as const, color: colors.danger };
      default:
        return { name: 'swap-horizontal-outline' as const, color: colors.textSecondary };
    }
  };

  const handleReferenceClick = (item: StockMovement) => {
    if (item.type === 'Purchase') {
      navigation.navigate(ROUTES.MAIN.PURCHASE, {
        screen: ROUTES.PURCHASE_SCREENS.DETAILS,
        params: { id: item.referenceId },
      });
    } else if (item.type === 'Kitchen Issue') {
      navigation.navigate(ROUTES.MAIN.KITCHEN_ISSUE, {
        screen: ROUTES.KITCHEN_ISSUE_SCREENS.DETAILS,
        params: { id: item.referenceId },
      });
    } else if (item.type === 'Waste') {
      navigation.navigate(ROUTES.MAIN.WASTE, {
        screen: ROUTES.WASTE_SCREENS.DETAILS,
        params: { id: item.referenceId },
      });
    }
  };

  const columns: Column<StockMovement>[] = [
    {
      key: 'date',
      title: 'Date Logged',
      flex: 1.4,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date)}</Text>,
    },
    {
      key: 'type',
      title: 'Action Type',
      flex: 1.1,
      render: (item) => {
        let badgeType: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (item.type === 'Purchase') badgeType = 'success';
        if (item.type === 'Kitchen Issue') badgeType = 'info';
        if (item.type === 'Waste') badgeType = 'danger';
        return <Badge label={item.type} type={badgeType} />;
      },
    },
    { key: 'productName', title: 'Product / Item Name', flex: 2.2 },
    {
      key: 'quantityChange',
      title: 'Qty Delta',
      flex: 1,
      align: 'right',
      render: (item) => {
        const prefix = item.quantityChange > 0 ? '+' : '';
        const color = item.quantityChange > 0 ? colors.success : colors.danger;
        return (
          <Text style={{ fontWeight: '600', color }}>
            {prefix}
            {item.quantityChange}
          </Text>
        );
      },
    },
    {
      key: 'balanceAfter',
      title: 'New Balance',
      flex: 1.1,
      align: 'right',
      render: (item) => <Text style={{ color: colors.text }}>{item.balanceAfter}</Text>,
    },
    {
      key: 'referenceId',
      title: 'Ref Doc',
      flex: 1.2,
      render: (item) => (
        <TouchableOpacity onPress={() => handleReferenceClick(item)}>
          <Text style={{ color: colors.primary, textDecorationLine: 'underline', fontWeight: '500', fontSize: 13 }}>
            {item.referenceId}
          </Text>
        </TouchableOpacity>
      ),
    },
  ];

  const typeOptions = [
    { label: 'All Operations', value: '' },
    { label: 'Purchases (Stock In)', value: 'Purchase' },
    { label: 'Kitchen Dispatches (Stock Out)', value: 'Kitchen Issue' },
    { label: 'Spoilages & Waste (Stock Out)', value: 'Waste' },
    { label: 'Adjustments (+/-)', value: 'Adjustment' },
  ];

  return (
    <ScreenContainer title="Stock Movements">
      <View style={styles.content}>
        <PageHeader
          title="Stock Card Ledgers"
          subtitle="Chronological track of all stock level updates across purchases, dispatches, and waste"
        >
          {/* Toggle buttons */}
          <View style={[styles.toggleWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'table' && { backgroundColor: colors.surface }]}
              onPress={() => setViewMode('table')}
            >
              <Ionicons name="list" size={16} color={colors.text} />
              <Text style={[styles.toggleText, { color: colors.text }]}>Table View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'timeline' && { backgroundColor: colors.surface }]}
              onPress={() => setViewMode('timeline')}
            >
              <Ionicons name="time" size={16} color={colors.text} />
              <Text style={[styles.toggleText, { color: colors.text }]}>Timeline View</Text>
            </TouchableOpacity>
          </View>
        </PageHeader>

        <TableToolbar
          searchValue={searchValue}
          onSearchChange={(val) => {
            setSearchValue(val);
            setPage(1);
          }}
          searchPlaceholder="Search product name or reference..."
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
                  label="Movement Type"
                  options={typeOptions}
                  selectedValue={type}
                  onValueChange={(val) => { setType(val as any); setPage(1); }}
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

        {viewMode === 'table' ? (
          <View style={styles.tableWrapper}>
            <DataTable
              data={data?.data || []}
              columns={columns}
              loading={isLoading}
              emptyText="No movements found matching the active filters."
            />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.timelineList}>
            {data && data.data.length > 0 ? (
              data.data.map((mvt, index) => {
                const iconDetails = getMovementIconDetails(mvt.type);
                const deltaPrefix = mvt.quantityChange > 0 ? '+' : '';
                return (
                  <View key={mvt.id} style={styles.timelineRow}>
                    <View style={styles.timelineLineWrapper}>
                      {/* Connecting vertical line */}
                      {index !== data.data.length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                      )}
                      {/* Bullet icon */}
                      <View style={[styles.timelineBullet, { backgroundColor: iconDetails.color + '15', borderColor: iconDetails.color }]}>
                        <Ionicons name={iconDetails.name} size={14} color={iconDetails.color} />
                      </View>
                    </View>

                    <Card style={styles.timelineCard}>
                      <View style={styles.timelineCardHeader}>
                        <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                          {formatDate(mvt.date)}
                        </Text>
                        <TouchableOpacity onPress={() => handleReferenceClick(mvt)}>
                          <Text style={[styles.timelineRef, { color: colors.primary }]}>
                            {mvt.referenceId}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.timelineProduct, { color: colors.text }]}>
                        {mvt.productName}
                      </Text>
                      <View style={styles.timelineMetrics}>
                        <Text style={[styles.timelineMetricLabel, { color: colors.textSecondary }]}>
                          Delta:{' '}
                          <Text style={{ fontWeight: '700', color: mvt.quantityChange > 0 ? colors.success : colors.danger }}>
                            {deltaPrefix}
                            {mvt.quantityChange}
                          </Text>
                        </Text>
                        <Text style={[styles.timelineMetricLabel, { color: colors.textSecondary }]}>
                          New Bal: <Text style={{ fontWeight: '700', color: colors.text }}>{mvt.balanceAfter}</Text>
                        </Text>
                      </View>
                    </Card>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyTimeline}>
                <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
                  No chronological stock movements recorded.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    flex: 1,
  },
  toggleWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
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
  timelineList: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
    flexGrow: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineLineWrapper: {
    width: 32,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    bottom: -24,
    width: 2,
  },
  timelineBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    flex: 1,
    padding: spacing.md,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 11,
  },
  timelineRef: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timelineProduct: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineMetrics: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  timelineMetricLabel: {
    fontSize: 12,
  },
  emptyTimeline: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StockMovementScreen;
