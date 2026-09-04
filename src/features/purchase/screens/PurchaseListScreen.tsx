import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Image, Platform, TouchableOpacity } from '@/web/primitives';
import { useNavigation } from '@/web/navigation';
import { NativeStackNavigationProp } from '@/web/navigation';
import { usePurchases, useUpdatePurchase } from '../hooks/usePurchases';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Drawer from '../../../shared/components/ui/Drawer';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { Purchase } from '../../../shared/mock/mockDb';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/constants/routes';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { useAllProductsRaw } from '../../inventory/hooks/useInventory';

type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const PurchaseListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Date range filters (applied on "Apply Filter" click)
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting states
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected row for Drawer view
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Fetch data
  const { data, isLoading } = usePurchases({
    page,
    pageSize,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  const { data: products = [] } = useAllProductsRaw();
  const updateMutation = useUpdatePurchase(selectedPurchase?.id || '');

  const getProductUnit = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    return prod?.unit || 'Kg';
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

  const getPaymentBadgeType = (status?: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIAL':
        return 'warning';
      case 'CREDIT':
      default:
        return 'danger';
    }
  };

  // Columns definition
  const columns: Column<Purchase>[] = [
    {
      key: 'orderDate',
      title: 'Date',
      flex: 1.2,
      sortable: true,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.orderDate, 'DD MMM YYYY')}</Text>,
    },
    { key: 'invoiceNo', title: 'Invoice No.', flex: 1.3, sortable: true },
    {
      key: 'vendorName',
      title: 'Vendor / Supplier',
      flex: 1.6,
      render: (item) => (
        <TouchableOpacity
          onPress={() => {
            if (item.vendorId) {
              (navigation as any).navigate(ROUTES.MAIN.VENDORS, {
                screen: ROUTES.VENDORS_SCREENS.DETAILS,
                params: { id: item.vendorId },
              });
            }
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '500', textDecorationLine: 'underline' }} numberOfLines={1}>
            {item.vendorName || '—'}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      key: 'itemsCount',
      title: 'Items',
      flex: 0.8,
      render: (item) => (
        <Text style={{ color: colors.textSecondary }}>
          {item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}
        </Text>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      flex: 1.2,
      align: 'right',
      sortable: true,
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatCurrency(item.totalAmount)}
        </Text>
      ),
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      flex: 1.1,
      align: 'center',
      render: (item) => (
        <Badge
          label={item.paymentStatus || 'CREDIT'}
          type={getPaymentBadgeType(item.paymentStatus)}
        />
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

  // Custom empty states
  const hasActiveFilters = !!(startDate || endDate);
  const emptyText = hasActiveFilters
    ? `No stock invoices found\n\nNo purchase records were found between\n${formatDate(startDate, 'DD MMM YYYY')} and ${formatDate(endDate, 'DD MMM YYYY')}.`
    : 'No purchase invoices found in history.';

  const handleClearFilters = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <ScreenContainer title="Stock Purchase Invoices">
      <View style={styles.content}>
        <PageHeader
          title="Stock Invoices (Purchase)"
          subtitle="Record and submit incoming food ingredients and raw materials deliveries"
          primaryAction={{
            title: 'New Restock Order',
            onPress: () => navigation.navigate(ROUTES.PURCHASE_SCREENS.CREATE as any),
          }}
        />

        {/* Date Filter Card (Permanently visible) */}
        <Card style={styles.filterCard}>
          <View style={styles.filterInputsRow}>
            <View style={styles.filterCol}>
              <DatePicker
                label="From Date"
                value={localStartDate}
                onChange={setLocalStartDate}
              />
            </View>
            <View style={styles.filterCol}>
              <DatePicker
                label="To Date"
                value={localEndDate}
                onChange={setLocalEndDate}
              />
            </View>
          </View>
          <View style={styles.filterActions}>
            <View style={styles.leftActions}>
              <Button
                title="Apply Filter"
                onPress={() => {
                  setStartDate(localStartDate);
                  setEndDate(localEndDate);
                  setPage(1);
                }}
                style={styles.actionBtn}
              />
              <Button
                title="Clear"
                variant="outline"
                onPress={handleClearFilters}
                style={styles.actionBtn}
              />
            </View>
            {Platform.OS === 'web' && (
              <Button
                title="🖨 Print Report"
                variant="outline"
                onPress={() => window.print()}
                style={styles.printBtn}
                disabled={!data?.data || data.data.length === 0}
              />
            )}
          </View>
        </Card>

        {/* List of Invoices */}
        <View style={styles.tableWrapper}>
          <DataTable
            data={data?.data || []}
            columns={columns}
            loading={isLoading}
            onRowPress={(item) => setSelectedPurchase(item)}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyText={emptyText}
            emptyActionText={hasActiveFilters ? "Clear Filter" : "Create Invoice"}
            onEmptyAction={() => {
              if (hasActiveFilters) {
                handleClearFilters();
              } else {
                navigation.navigate(ROUTES.PURCHASE_SCREENS.CREATE as any);
              }
            }}
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
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vendor / Supplier</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '600' }]}>{selectedPurchase.vendorName || '—'}</Text>
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
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Paid / Due</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  <Text style={{ color: colors.success }}>{formatCurrency(selectedPurchase.paidAmount || 0)}</Text> / <Text style={{ color: (selectedPurchase.dueAmount || 0) > 0 ? colors.danger : colors.textSecondary }}>{formatCurrency(selectedPurchase.dueAmount || 0)}</Text>
                </Text>
              </View>
              <View style={styles.drawerSummaryRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Status</Text>
                <Badge
                  label={selectedPurchase.paymentStatus || 'CREDIT'}
                  type={getPaymentBadgeType(selectedPurchase.paymentStatus)}
                />
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
                  {item.quantity} {getProductUnit(item.productId)}
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

            {selectedPurchase.photoUrl ? (
              <View style={styles.drawerPhotoSection}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Invoice Photo</Text>
                <Image source={{ uri: selectedPurchase.photoUrl }} style={styles.drawerInvoicePhoto} resizeMode="contain" />
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
                <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                  <Button
                    title="View Full Invoice"
                    onPress={() => {
                      setSelectedPurchase(null);
                      navigation.navigate(ROUTES.PURCHASE_SCREENS.DETAILS, { id: selectedPurchase.id });
                    }}
                    style={{ flex: 1.2 }}
                  />
                  <Button
                    title="Close"
                    onPress={() => setSelectedPurchase(null)}
                    variant="outline"
                    style={{ flex: 0.8 }}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </Drawer>

      {/* Hidden Print Area representing the Period Report */}
      {Platform.OS === 'web' && (
        <div id="print-area">
          <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#000', backgroundColor: '#fff' }}>
            <h1 style={{ textAlign: 'center', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>RESTAURANT STORE ERP</h1>
            <h2 style={{ textAlign: 'center', margin: '5px 0 15px 0', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Purchase Report</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '13px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
              <strong>Period:</strong> {startDate ? formatDate(startDate, 'DD MMM YYYY') : 'All Time'} — {endDate ? formatDate(endDate, 'DD MMM YYYY') : 'All Time'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 'bold' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 'bold' }}>Invoice No.</th>
                  <th style={{ textAlign: 'center', padding: '8px 4px', fontWeight: 'bold' }}>Items</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px 4px' }}>{formatDate(item.orderDate, 'DD MMM YYYY')}</td>
                    <td style={{ padding: '8px 4px' }}>{item.invoiceNo}</td>
                    <td style={{ textAlign: 'center', padding: '8px 4px' }}>{item.items.length}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{formatCurrency(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px' }}>
              <div style={{ marginBottom: '5px' }}><strong>Total Invoices:</strong> {data?.totalCount || 0}</div>
              <div><strong style={{ fontSize: '14px' }}>Total Purchase Value:</strong> {formatCurrency((data?.data || []).reduce((sum, item) => sum + item.totalAmount, 0))}</div>
            </div>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    flex: 1,
  },
  filterCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  filterInputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.sm,
  },
  filterCol: {
    flex: 1,
    minWidth: 150,
    paddingHorizontal: spacing.sm,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  leftActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    minWidth: 100,
    height: 36,
  },
  printBtn: {
    minWidth: 120,
    height: 36,
  },
  tableWrapper: {
    flex: 1,
    marginTop: spacing.xs,
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
  itemHeaderQty: { flex: 0.8, fontSize: 11, fontWeight: '600', textAlign: 'center' },
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
  itemCellQty: { flex: 0.8, fontSize: 12, textAlign: 'center' },
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
  drawerPhotoSection: {
    marginTop: spacing.sm,
    gap: 4,
  },
  drawerInvoicePhoto: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default PurchaseListScreen;
