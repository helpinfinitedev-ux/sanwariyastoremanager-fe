import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useProductDetails } from '../hooks/useInventory';
import { useStockMovements } from '../../stock-movement/hooks/useStockMovements';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { formatCurrency, formatNumber, formatDate } from '../../../shared/utils/formatters';
import { getStockStatus } from '../../../shared/utils/calculations';
import { StockMovement } from '../../../shared/mock/mockDb';
import { InventoryStackParamList } from '../../../app/navigation/types';

type RoutePropType = RouteProp<InventoryStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const { id } = route.params;

  const { data: product, isLoading: prodLoading, isError: prodError, refetch: refetchProd } = useProductDetails(id);

  // Pagination for movements list
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: movementsData, isLoading: mvtsLoading } = useStockMovements({
    page,
    pageSize,
    search: '',
    type: '',
    productId: id,
  });

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  if (prodLoading) {
    return (
      <ScreenContainer title="Stock Card Details">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading ingredient file...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (prodError || !product) {
    return (
      <ScreenContainer title="Stock Card Details">
        <ErrorState
          message="Could not load the requested product's history."
          onRetry={refetchProd}
        />
      </ScreenContainer>
    );
  }

  const stockStatus = getStockStatus(product);

  const columns: Column<StockMovement>[] = [
    {
      key: 'date',
      title: 'Movement Date',
      flex: 1.5,
      render: (item) => <Text style={{ color: colors.text }}>{formatDate(item.date)}</Text>,
    },
    {
      key: 'type',
      title: 'Action Type',
      flex: 1.2,
      render: (item) => {
        let typeBadge: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (item.type === 'Purchase') typeBadge = 'success';
        if (item.type === 'Kitchen Issue') typeBadge = 'info';
        if (item.type === 'Waste') typeBadge = 'danger';
        return <Badge label={item.type} type={typeBadge} />;
      },
    },
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
      title: 'Stock Balance',
      flex: 1.2,
      align: 'right',
      render: (item) => (
        <Text style={{ color: colors.text }}>
          {item.balanceAfter} {product.unit}
        </Text>
      ),
    },
    { key: 'referenceId', title: 'Ref Doc', flex: 1.2 },
  ];

  return (
    <ScreenContainer title={`Stock Card: ${product.sku}`}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title={`${product.name}`}
          subtitle={`Detailed SKU Stock Card, purchase costs, and tracking movements ledger`}
        />

        <View style={[styles.mainLayout, isDesktop && styles.rowLayout]}>
          {/* Product Profile & Metrics Card */}
          <Card style={[styles.card, { flex: 1 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Information</Text>

            <View style={styles.metricsList}>
              <View style={styles.metricRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>SKU Code</Text>
                <Text style={[styles.value, { color: colors.text, fontWeight: '700' }]}>{product.sku}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
                <Text style={[styles.value, { color: colors.text }]}>{product.category}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Active Stock</Text>
                <Text style={[styles.value, { color: colors.text, fontWeight: '700' }]}>
                  {formatNumber(product.currentStock, 0)} {product.unit}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Stock Status</Text>
                <Badge
                  label={stockStatus}
                  type={stockStatus === 'In Stock' ? 'success' : stockStatus === 'Low Stock' ? 'warning' : 'danger'}
                />
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Min Threshold</Text>
                <Text style={[styles.value, { color: colors.text }]}>{product.minStock} {product.unit}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Max Capacity</Text>
                <Text style={[styles.value, { color: colors.text }]}>{product.maxStock} {product.unit}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Custom SVG Mini Cost Chart */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
              Cost Valuation Rate
            </Text>
            
            <View style={styles.chartContainer}>
              <View style={styles.barWrapper}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Last Cost</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: colors.info, width: '90%' }]} />
                </View>
                <Text style={[styles.barVal, { color: colors.text }]}>
                  {formatCurrency(product.purchaseCost)}
                </Text>
              </View>

              <View style={styles.barWrapper}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Avg Cost</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: colors.primary, width: `${(product.avgCost / Math.max(product.purchaseCost, 1)) * 90}%` }]} />
                </View>
                <Text style={[styles.barVal, { color: colors.text }]}>
                  {formatCurrency(product.avgCost)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Chronological Movements Ledgers */}
          <Card style={[styles.card, { flex: 2 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
              Stock Movement History
            </Text>

            <View style={styles.tableWrapper}>
              <DataTable
                data={movementsData?.data || []}
                columns={columns}
                loading={mvtsLoading}
                emptyText="No historical stock movements found for this SKU."
              />
            </View>

            <TablePagination
              page={page}
              pageSize={pageSize}
              totalCount={movementsData?.totalCount || 0}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </Card>
        </View>
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
  mainLayout: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  card: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  metricsList: {
    gap: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  chartContainer: {
    gap: spacing.sm,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    width: 65,
    fontSize: 12,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barVal: {
    width: 65,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  tableWrapper: {
    flex: 1,
    minHeight: 300,
  },
});

export default ProductDetailsScreen;
