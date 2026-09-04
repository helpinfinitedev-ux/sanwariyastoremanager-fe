import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, FlatList, Alert } from '@/web/primitives';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Badge from '../../../shared/components/ui/Badge';
import Card from '../../../shared/components/ui/Card';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { useVendors, useCreateVendor, useUpdateVendor } from '../hooks/useVendors';
import { Vendor } from '../types/vendor.types';
import VendorCard from '../components/VendorCard';
import VendorFormModal from '../components/VendorFormModal';
import { ROUTES } from '../../../shared/constants/routes';
import { useNavigation } from '@/web/navigation';

const STATUS_FILTER_OPTIONS = [
  { label: 'All Vendors', value: 'ALL' },
  { label: 'Has Outstanding Due', value: 'DUE' },
  { label: 'Active Only', value: 'ACTIVE' },
];

export const VendorListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { data: vendors, isLoading, isError, refetch } = useVendors();
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Overall totals
  const totalVendors = vendors?.length || 0;
  const grandTotalPurchases = vendors?.reduce((sum, v) => sum + (v.totalPurchase || 0), 0) || 0;
  const grandTotalPaid = vendors?.reduce((sum, v) => sum + (v.totalPaid || 0), 0) || 0;
  const grandTotalOutstanding = vendors?.reduce((sum, v) => sum + (v.outstanding || 0), 0) || 0;

  // Filtered List
  const filteredVendors = (vendors || []).filter(v => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchFirm = v.firmName.toLowerCase().includes(q);
      const matchName = v.name.toLowerCase().includes(q);
      const matchPhone = v.phone.includes(q);
      const matchGst = v.gstin ? v.gstin.toLowerCase().includes(q) : false;
      if (!matchFirm && !matchName && !matchPhone && !matchGst) return false;
    }

    if (statusFilter === 'DUE' && (v.outstanding || 0) <= 0) return false;
    if (statusFilter === 'ACTIVE' && v.status !== 'Active') return false;

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    if (editingVendor) {
      await updateVendorMutation.mutateAsync({ id: editingVendor.id, data: formData });
    } else {
      await createVendorMutation.mutateAsync(formData);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading vendors data..." />;
  if (isError) return <ErrorState message="Failed to load vendors" onRetry={refetch} />;

  return (
    <ScreenContainer>
      <PageHeader
        title="Vendor Management"
        subtitle="Manage supplier firms, payment terms, purchase history & ledgers"
        action={
          <Button variant="primary" icon="add-outline" onPress={handleOpenAddModal}>
            Add Vendor
          </Button>
        }
      />

      {/* KPI Overview Cards */}
      <View style={styles.kpiGrid}>
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Vendors</Text>
          <Text style={[styles.kpiValue, { color: colors.text }]}>{totalVendors}</Text>
        </Card>
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Purchases</Text>
          <Text style={[styles.kpiValue, { color: colors.text }]}>
            ₹{grandTotalPurchases.toLocaleString('en-IN')}
          </Text>
        </Card>
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Paid</Text>
          <Text style={[styles.kpiValue, { color: colors.success }]}>
            ₹{grandTotalPaid.toLocaleString('en-IN')}
          </Text>
        </Card>
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Outstanding</Text>
          <Text style={[styles.kpiValue, { color: grandTotalOutstanding > 0 ? colors.danger : colors.textSecondary }]}>
            ₹{grandTotalOutstanding.toLocaleString('en-IN')}
          </Text>
        </Card>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={{ flex: 2 }}>
          <Input
            placeholder="Search Firm, Vendor, Phone, or GSTIN..."
            value={search}
            onChangeText={setSearch}
            icon="search-outline"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onSelect={setStatusFilter}
          />
        </View>
      </View>

      {/* List / Cards */}
      <FlatList
        data={filteredVendors}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No vendors found. Tap "+ Add Vendor" to register a supplier.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <VendorCard
            vendor={item}
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.VENDORS, {
                screen: 'VendorDetails',
                params: { id: item.id },
              })
            }
            onEdit={() => handleOpenEditModal(item)}
          />
        )}
      />

      {/* Add / Edit Modal */}
      <VendorFormModal
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingVendor}
        loading={createVendorMutation.isPending || updateVendorMutation.isPending}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
    padding: spacing.md,
  },
  kpiLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});

export default VendorListScreen;
