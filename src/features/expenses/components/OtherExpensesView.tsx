import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, useWindowDimensions } from '@/web/primitives';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Ionicons } from '@/web/icons';
import { useOtherExpenses, useCreateOtherExpense, useUpdateOtherExpense, useDeleteOtherExpense } from '../hooks/useExpenses';
import { OtherExpense, OtherExpenseFormInputs } from '../types/expenses.types';
import OtherExpenseFormModal from './OtherExpenseFormModal';
import { dayjs } from '../../../shared/utils/formatters';

export const OtherExpensesView: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { data: expenses, isLoading, isError, refetch } = useOtherExpenses();
  const createMutation = useCreateOtherExpense();
  const updateMutation = useUpdateOtherExpense();
  const deleteMutation = useDeleteOtherExpense();

  // Dynamically build category filter options from actual expense data
  const categoryFilterOptions = useMemo(() => {
    const categories = new Set<string>();
    (expenses || []).forEach(e => { if (e.category) categories.add(e.category); });
    const opts = Array.from(categories).sort().map(c => ({ label: c, value: c }));
    return [{ label: 'All Categories', value: 'ALL' }, ...opts];
  }, [expenses]);

  // Simple Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<OtherExpense | null>(null);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter(item => {
      // Category
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // Date Range
      if (fromDate) {
        const itemDate = dayjs(item.date);
        if (itemDate.isBefore(dayjs(fromDate).startOf('day'))) return false;
      }
      if (toDate) {
        const itemDate = dayjs(item.date);
        if (itemDate.isAfter(dayjs(toDate).endOf('day'))) return false;
      }

      return true;
    });
  }, [expenses, categoryFilter, fromDate, toDate]);

  // Total of filtered expenses
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: OtherExpense) => {
    setEditingExpense(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: OtherExpense) => {
    const confirmMessage = `Delete this ${item.category} expense of ₹${item.amount.toLocaleString('en-IN')}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        deleteMutation.mutate(item.id);
      }
    } else {
      Alert.alert('Delete this expense?', confirmMessage, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(item.id),
        },
      ]);
    }
  };

  const handleFormSubmit = async (formData: OtherExpenseFormInputs) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({ id: editingExpense.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleResetFilters = () => {
    setCategoryFilter('ALL');
    setFromDate('');
    setToDate('');
  };

  if (isLoading) return <LoadingSpinner message="Loading expenses..." />;
  if (isError) return <ErrorState message="Failed to load expenses." onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <Card style={[styles.summaryCard, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <View style={[styles.summaryIconBox, { backgroundColor: colors.warningBg }]}>
              <Ionicons name="cash-outline" size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Other Expenses</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <Button variant="primary" icon="add-outline" size="small" onPress={handleOpenAdd}>
            + Add Other Expense
          </Button>
        </View>
      </Card>

      {/* Simple Filter Controls */}
      <Card style={[styles.filterCard, { borderColor: colors.border }]}>
        <View style={[styles.filterRow, !isDesktop && styles.filterRowMobile]}>
          <View style={styles.filterCol}>
            <DatePicker
              label="Date From"
              value={fromDate}
              onChange={setFromDate}
              placeholder="DD/MM/YYYY"
            />
          </View>
          <View style={styles.filterCol}>
            <DatePicker
              label="Date To"
              value={toDate}
              onChange={setToDate}
              placeholder="DD/MM/YYYY"
            />
          </View>
          <View style={styles.filterCol}>
            <Select
              label="Category"
              options={categoryFilterOptions}
              value={categoryFilter}
              onSelect={setCategoryFilter}
            />
          </View>
          <View style={[styles.filterCol, { justifyContent: 'flex-end', paddingBottom: spacing.sm }]}>
            <Button variant="outline" size="small" onPress={handleResetFilters}>
              Reset
            </Button>
          </View>
        </View>
      </Card>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Ionicons name="receipt-outline" size={36} color={colors.textSecondary} style={{ marginBottom: spacing.sm }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No expenses found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Tap "+ Add Other Expense" to record a new expense.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={[styles.itemCard, { borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Badge label={item.category} type="default" />
                <Badge label={item.paymentMethod} type="default" />
              </View>
              <Text style={[styles.amountText, { color: colors.text }]}>
                ₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>

            {item.remark ? (
              <Text style={[styles.remarkText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.remark}
              </Text>
            ) : null}

            <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {dayjs(item.date).format('DD MMM YYYY')}
              </Text>

              <View style={styles.actionsGroup}>
                <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.actionBtn} activeOpacity={0.7}>
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionLabel, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.actionLabel, { color: colors.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Add / Edit Modal */}
      <OtherExpenseFormModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  filterCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterRowMobile: {
    flexDirection: 'column',
  },
  filterCol: {
    flex: 1,
    minWidth: 140,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  itemCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  remarkText: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11.5,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default OtherExpensesView;
