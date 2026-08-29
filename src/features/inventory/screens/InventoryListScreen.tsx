import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInventoryList, useCategories } from '../hooks/useInventory';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable, { Column } from '../../../shared/components/table/DataTable';
import TablePagination from '../../../shared/components/table/TablePagination';
import TableToolbar from '../../../shared/components/table/TableToolbar';
import Drawer from '../../../shared/components/ui/Drawer';
import Badge from '../../../shared/components/ui/Badge';
import Card from '../../../shared/components/ui/Card';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import { Product } from '../../../shared/mock/mockDb';
import IngredientCreateModal from '../../../shared/components/modals/IngredientCreateModal';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';
import { getStockStatus } from '../../../shared/utils/calculations';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { ROUTES } from '../../../shared/constants/routes';
import { InventoryStackParamList } from '../../../app/navigation/types';

type NavigationProp = NativeStackNavigationProp<InventoryStackParamList>;

export const InventoryListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [ingModalVisible, setIngModalVisible] = useState(false);
  const { data: categoriesData = [] } = useCategories();

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 400);

  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Low Stock' | 'Out of Stock' | ''>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer selected item
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading } = useInventoryList({
    page,
    pageSize,
    search: debouncedSearch,
    category,
    stockStatus,
  });

  const hasActiveFilters = !!(category || stockStatus);

  const handleClearFilters = () => {
    setCategory('');
    setStockStatus('');
    setPage(1);
  };

  const columns: Column<Product>[] = [
    { key: 'sku', title: 'SKU Code', flex: 1.2, sortable: false },
    { key: 'name', title: 'Product Name', flex: 2.2, sortable: false },
    { key: 'category', title: 'Category', flex: 1.5, sortable: false, hideOnTablet: true },
    {
      key: 'currentStock',
      title: 'Current Stock',
      flex: 1.3,
      align: 'right',
      render: (item) => (
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {formatNumber(item.currentStock, 0)} {item.unit}
        </Text>
      ),
    },
    {
      key: 'purchaseCost',
      title: 'Last Cost',
      flex: 1.1,
      align: 'right',
      render: (item) => <Text style={{ color: colors.text }}>{formatCurrency(item.purchaseCost)}</Text>,
    },
    {
      key: 'status',
      title: 'Status',
      flex: 1.2,
      align: 'center',
      render: (item) => {
        const stat = getStockStatus(item);
        return (
          <Badge
            label={stat}
            type={stat === 'In Stock' ? 'success' : stat === 'Low Stock' ? 'warning' : 'danger'}
          />
        );
      },
    },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categoriesData.map((cat) => ({ label: cat.name, value: cat.name })),
  ];

  const statusOptions = [
    { label: 'All Stock Statuses', value: '' },
    { label: 'In Stock', value: 'In Stock' },
    { label: 'Low Stock', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' },
  ];

  return (
    <ScreenContainer title="Inventory Levels">
      <View style={styles.content}>
        <PageHeader
          title="Warehouse & Storage Stocks"
          subtitle="View ingredient quantites, average purchase rates, and min threshold warnings"
          primaryAction={{
            title: 'New Ingredient',
            onPress: () => setIngModalVisible(true),
          }}
        />

        <TableToolbar
          searchValue={searchValue}
          onSearchChange={(val) => {
            setSearchValue(val);
            setPage(1);
          }}
          searchPlaceholder="Search product by name or SKU..."
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
                  label="Product Category"
                  options={categoryOptions}
                  selectedValue={category}
                  onValueChange={(val) => { setCategory(val); setPage(1); }}
                />
              </View>
              <View style={styles.filterCol}>
                <Select
                  label="Stock Threshold Alert"
                  options={statusOptions}
                  selectedValue={stockStatus}
                  onValueChange={(val) => { setStockStatus(val as any); setPage(1); }}
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
            onRowPress={(item) => setSelectedProduct(item)}
            emptyText="No ingredients found matching filters."
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

      {/* Slide-out Product Details Drawer */}
      <Drawer
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={`Product Details: ${selectedProduct?.name}`}
      >
        {selectedProduct && (
          <View style={styles.drawerDetails}>
            <View style={styles.drawerSummary}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>SKU Reference</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '600' }]}>
                  {selectedProduct.sku}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Category</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{selectedProduct.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current Stock</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '700' }]}>
                  {formatNumber(selectedProduct.currentStock, 0)} {selectedProduct.unit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Safety (Min) Stock</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatNumber(selectedProduct.minStock, 0)} {selectedProduct.unit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Max Stock Capacity</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatNumber(selectedProduct.maxStock, 0)} {selectedProduct.unit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Last Purchase Cost</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatCurrency(selectedProduct.purchaseCost)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Average Cost Basis</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatCurrency(selectedProduct.avgCost)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Inventory Valuation</Text>
                <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
                  {formatCurrency(selectedProduct.currentStock * selectedProduct.avgCost)}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.drawerActions}>
              <Button
                title="View Full Stock History"
                onPress={() => {
                  setSelectedProduct(null);
                  navigation.navigate(ROUTES.INVENTORY_SCREENS.DETAILS, { id: selectedProduct.id });
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </Drawer>

      <IngredientCreateModal
        visible={ingModalVisible}
        onClose={() => setIngModalVisible(false)}
      />
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
    minWidth: 200,
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
  drawerActions: {
    marginTop: spacing.md,
  },
});

export default InventoryListScreen;
