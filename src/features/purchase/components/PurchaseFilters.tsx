import React from 'react';
import { View, StyleSheet, Text } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import { useVendors } from '../hooks/usePurchases';

interface PurchaseFiltersProps {
  status: 'Draft' | 'Submitted' | '';
  setStatus: (status: 'Draft' | 'Submitted' | '') => void;
  vendorId: string;
  setVendorId: (id: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export const PurchaseFilters: React.FC<PurchaseFiltersProps> = ({
  status,
  setStatus,
  vendorId,
  setVendorId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const { colors } = useTheme();
  const { data: vendors } = useVendors();

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Submitted', value: 'Submitted' },
  ];

  const vendorOptions = [
    { label: 'All Vendors', value: '' },
    ...(vendors || []).map((v) => ({ label: v.name, value: v.id })),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Filter Purchase Invoices</Text>
      
      <View style={styles.fields}>
        <View style={styles.fieldWrapper}>
          <Select
            label="Invoice Status"
            options={statusOptions}
            selectedValue={status}
            onValueChange={(val) => setStatus(val as any)}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <Select
            label="Vendor / Partner"
            options={vendorOptions}
            selectedValue={vendorId}
            onValueChange={setVendorId}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <DatePicker
            label="From Date"
            value={startDate}
            onChange={setStartDate}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <DatePicker
            label="To Date"
            value={endDate}
            onChange={setEndDate}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  fields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  fieldWrapper: {
    flex: 1,
    minWidth: 180,
  },
});

export default PurchaseFilters;
