import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Button from '../../../shared/components/ui/Button';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { useIngredientExpenses } from '../hooks/useExpenses';
import { dayjs } from '../../../shared/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export const IngredientExpensesView: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { data: records, isLoading, isError, refetch } = useIngredientExpenses();

  // Simple filters: Date From, Date To, Ingredient
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('ALL');

  // Extract unique ingredients list
  const ingredientOptions = useMemo(() => {
    const list = new Set<string>();
    (records || []).forEach(r => list.add(r.ingredientName));
    const opts = Array.from(list).sort().map(name => ({ label: name, value: name }));
    return [{ label: 'All Ingredients', value: 'ALL' }, ...opts];
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return (records || []).filter(item => {
      // Ingredient filter
      if (selectedIngredient !== 'ALL' && item.ingredientName !== selectedIngredient) {
        return false;
      }

      // Date range filter
      if (fromDate) {
        const itemDate = dayjs(item.orderDate);
        if (itemDate.isBefore(dayjs(fromDate).startOf('day'))) return false;
      }
      if (toDate) {
        const itemDate = dayjs(item.orderDate);
        if (itemDate.isAfter(dayjs(toDate).endOf('day'))) return false;
      }

      return true;
    });
  }, [records, selectedIngredient, fromDate, toDate]);

  // Compute summary from filtered records
  const summary = useMemo(() => {
    let totalPurchase = 0;
    let totalPaid = 0;
    let totalDue = 0;

    filteredRecords.forEach(r => {
      totalPurchase += r.totalAmount;
      totalPaid += r.paidAmount;
      totalDue += r.dueAmount;
    });

    return { totalPurchase, totalPaid, totalDue };
  }, [filteredRecords]);

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedIngredient('ALL');
  };

  const renderBadge = (status: 'PAID' | 'PARTIAL' | 'CREDIT') => {
    switch (status) {
      case 'PAID':
        return <Badge label="PAID" type="success" />;
      case 'PARTIAL':
        return <Badge label="PARTIAL" type="warning" />;
      case 'CREDIT':
      default:
        return <Badge label="CREDIT" type="danger" />;
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading ingredient purchases..." />;
  if (isError) return <ErrorState message="Failed to load ingredient purchases." onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={[styles.summaryRow, !isDesktop && styles.summaryRowMobile]}>
        <Card style={[styles.summaryCard, { borderColor: colors.border }]}>
          <View style={[styles.summaryIconBox, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="cart-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Purchase</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ₹{summary.totalPurchase.toLocaleString('en-IN')}
            </Text>
          </View>
        </Card>

        <Card style={[styles.summaryCard, { borderColor: colors.border }]}>
          <View style={[styles.summaryIconBox, { backgroundColor: colors.successBg }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              ₹{summary.totalPaid.toLocaleString('en-IN')}
            </Text>
          </View>
        </Card>

        <Card style={[styles.summaryCard, { borderColor: colors.border }]}>
          <View style={[styles.summaryIconBox, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Due</Text>
            <Text style={[styles.summaryValue, { color: summary.totalDue > 0 ? colors.danger : colors.textSecondary }]}>
              ₹{summary.totalDue.toLocaleString('en-IN')}
            </Text>
          </View>
        </Card>
      </View>

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
              label="Ingredient / Product"
              options={ingredientOptions}
              value={selectedIngredient}
              onSelect={setSelectedIngredient}
            />
          </View>
          <View style={[styles.filterCol, { justifyContent: 'flex-end', paddingBottom: spacing.sm }]}>
            <Button variant="outline" size="small" onPress={handleResetFilters}>
              Reset
            </Button>
          </View>
        </View>
      </Card>

      {/* Info banner: no add button here */}
      <View style={[styles.infoBanner, { backgroundColor: colors.infoBg, borderColor: colors.info + '30' }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.info} />
        <Text style={[styles.infoBannerText, { color: colors.info }]}>
          Ingredient purchases are managed from Purchase Management. This is a read-only view.
        </Text>
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Ionicons name="basket-outline" size={36} color={colors.textSecondary} style={{ marginBottom: spacing.sm }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No ingredient purchases found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Adjust the date range or ingredient filter, or create a purchase in Purchase Management.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={[styles.recordCard, { borderColor: colors.border }]}>
            <View style={styles.recordHeader}>
              <View style={styles.ingredientInfo}>
                <Text style={[styles.ingredientTitle, { color: colors.text }]}>
                  {item.ingredientName}
                </Text>
                <Text style={[styles.vendorSub, { color: colors.textSecondary }]}>
                  {item.vendorName} • Invoice: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.invoiceNo}</Text>
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {renderBadge(item.paymentStatus)}
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {dayjs(item.orderDate).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>

            {/* Calculation row */}
            <View style={[styles.calcBanner, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
              <View style={styles.calcCol}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Qty & Rate</Text>
                <Text style={[styles.calcVal, { color: colors.text }]}>
                  {item.quantity} {item.unit} × ₹{item.unitCost.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.calcCol}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Total</Text>
                <Text style={[styles.calcVal, { color: colors.text, fontWeight: '700' }]}>
                  ₹{item.totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.calcCol}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Paid</Text>
                <Text style={[styles.calcVal, { color: colors.success }]}>
                  ₹{item.paidAmount.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.calcCol}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Due</Text>
                <Text style={[styles.calcVal, { color: item.dueAmount > 0 ? colors.danger : colors.textSecondary }]}>
                  ₹{item.dueAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryRowMobile: {
    flexDirection: 'column',
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  infoBannerText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  recordCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    gap: spacing.xs,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  vendorSub: {
    fontSize: 12,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
  },
  calcBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  calcCol: {
    flex: 1,
    minWidth: 80,
  },
  calcLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
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

export default IngredientExpensesView;
