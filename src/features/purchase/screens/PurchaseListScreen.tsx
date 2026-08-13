import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePurchases, useUpdatePurchase } from '../hooks/usePurchases';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import TableToolbar from '../../../shared/components/table/TableToolbar';
import PurchaseFilters from '../components/PurchaseFilters';
import Drawer from '../../../shared/components/ui/Drawer';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { Purchase } from '../../../shared/mock/mockDb';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/constants/routes';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';

type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const PurchaseListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Filter & Search states
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 400);

  const [status, setStatus] = useState<'Draft' | 'Submitted' | ''>('');
  const [vendorId, setVendorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting states
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected row for Drawer view
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // TanStack Query list fetch
  const { data, isLoading, refetch } = usePurchases({
    page,
    pageSize,
    search: debouncedSearch,
    status,
    vendorId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  const updateMutation = useUpdatePurchase(selectedPurchase?.id || '');

  const hasActiveFilters = !!(status || vendorId || startDate || endDate);

  const handleClearFilters = () => {
    setStatus('');
    setVendorId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSubmitDraft = () => {
    if (!selectedPurchase) return;
    updateMutation.mutate({ status: 'Submitted' }, {
      onSuccess: (updated) => {
        setSelectedPurchase(updated);
      }
    });
  };

  // Reusable columns definition
  const columns: Column<Purchase>[] = [
    { key: 'invoiceNo', title: 'Invoice No', flex: 1.2, sortable: true },
    { key: 'vendorName', title: 'Vendor / Partner', flex: 1.8, sortable: true },
    {
      key: 'orderDate',
      title: 'Order Date',
      flex: 1.5,
      sortable: true,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.orderDate, 'MMM DD, YYYY')}</Text>,
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      flex: 1.3,
      align: 'right',
      sortable: true,
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatCurrency(item.totalAmount)}
        </Text>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      flex: 1,
      align: 'center',
      render: (item) => (
        <Badge
          label={item.status}
          type={item.status === 'Submitted' ? 'success' : 'warning'}
        />
      ),
    },
  ];

  return (
    <ScreenContainer title="Purchase Orders">
      <View style={styles.content}>
        <PageHeader
          title="Stock Invoices (Purchase)"
          subtitle="Record and submit incoming food ingredients and raw materials deliveries"
          primaryAction={{
            title: 'New Restock Order',
            onPress: () => navigation.navigate(ROUTES.PURCHASE_SCREENS.CREATE as any),
          }}
        />

        <TableToolbar
          searchValue={searchValue}
          onSearchChange={(val) => {
            setSearchValue(val);
            setPage(1);
          }}
          searchPlaceholder="Search invoice # or vendor..."
          filterOpen={filtersOpen}
          onToggleFilter={() => setFiltersOpen(!filtersOpen)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        {filtersOpen && (
          <PurchaseFilters
            status={status}
            setStatus={(s) => { setStatus(s); setPage(1); }}
            vendorId={vendorId}
            setVendorId={(id) => { setVendorId(id); setPage(1); }}
            startDate={startDate}
            setStartDate={(d) => { setStartDate(d); setPage(1); }}
            endDate={endDate}
            setEndDate={(d) => { setEndDate(d); setPage(1); }}
          />
        )}

        <View style={styles.tableWrapper}>
          <DataTable
            data={data?.data || []}
            columns={columns}
            loading={isLoading}
            onRowPress={(item) => setSelectedPurchase(item)}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyText="No purchase invoices match your filter criteria."
            emptyActionText="Create Invoice"
            onEmptyAction={() => navigation.navigate(ROUTES.PURCHASE_SCREENS.CREATE as any)}
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

      {/* Details Side-Drawer */}
      <Drawer
        visible={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        title={`Invoice Summary: ${selectedPurchase?.invoiceNo}`}
      >
        {selectedPurchase && (
          <View style={styles.drawerDetails}>
            <View style={styles.drawerSummary}>
              <View style={styles.drawerSummaryRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vendor / Partner</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{selectedPurchase.vendorName}</Text>
              </View>
              <View style={styles.drawerSummaryRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date Logged</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(selectedPurchase.orderDate)}</Text>
              </View>
              <View style={styles.drawerSummaryRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Invoice Total</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '700' }]}>
                  {formatCurrency(selectedPurchase.totalAmount)}
                </Text>
              </View>
              <View style={styles.drawerSummaryRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Invoice Status</Text>
                <Badge
                  label={selectedPurchase.status}
                  type={selectedPurchase.status === 'Submitted' ? 'success' : 'warning'}
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Line Items List */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Line Item Details</Text>
            <View style={[styles.lineItemsHeader, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
              <Text style={[styles.itemHeaderName, { color: colors.textSecondary }]}>Product</Text>
              <Text style={[styles.itemHeaderQty, { color: colors.textSecondary }]}>Qty</Text>
              <Text style={[styles.itemHeaderCost, { color: colors.textSecondary }]}>Unit Cost</Text>
              <Text style={[styles.itemHeaderSub, { color: colors.textSecondary }]}>Total</Text>
            </View>

            {selectedPurchase.items.map((item, idx) => (
              <View key={`${item.productId}-${idx}`} style={[styles.lineItemRow, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.itemCellName, { color: colors.text }]} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={[styles.itemCellQty, { color: colors.textSecondary }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.itemCellCost, { color: colors.textSecondary }]}>
                  {formatCurrency(item.unitCost)}
                </Text>
                <Text style={[styles.itemCellSub, { color: colors.text, fontWeight: '500' }]}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}

            {selectedPurchase.notes ? (
              <View style={styles.notesBox}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes</Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{selectedPurchase.notes}</Text>
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Drawer Actions */}
            <View style={styles.drawerActions}>
              {selectedPurchase.status === 'Draft' ? (
                <>
                  <Button
                    title="Edit Draft"
                    onPress={() => {
                      setSelectedPurchase(null);
                      navigation.navigate(ROUTES.PURCHASE_SCREENS.EDIT, { id: selectedPurchase.id });
                    }}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Submit Order"
                    onPress={handleSubmitDraft}
                    loading={updateMutation.isPending}
                    style={{ flex: 1.2 }}
                  />
                </>
              ) : (
                <Button
                  title="Close Panel"
                  onPress={() => setSelectedPurchase(null)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              )}
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
  drawerSummaryRow: {
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  itemHeaderName: { flex: 2, fontSize: 11, fontWeight: '600' },
  itemHeaderQty: { flex: 0.6, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  itemHeaderCost: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  itemHeaderSub: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  
  lineItemRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  itemCellName: { flex: 2, fontSize: 12 },
  itemCellQty: { flex: 0.6, fontSize: 12, textAlign: 'center' },
  itemCellCost: { flex: 1, fontSize: 12, textAlign: 'right' },
  itemCellSub: { flex: 1, fontSize: 12, textAlign: 'right' },

  notesBox: {
    marginTop: spacing.sm,
  },
  notesText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  drawerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

export default PurchaseListScreen;
