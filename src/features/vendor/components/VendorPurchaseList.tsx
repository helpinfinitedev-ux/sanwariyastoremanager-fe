import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Purchase } from '../../../shared/mock/mockDb';
import { dayjs } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/constants/routes';

interface VendorPurchaseListProps {
  purchases: Purchase[];
  onPayPurchase?: (purchase: Purchase) => void;
}

const PAYMENT_STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'PAID', value: 'PAID' },
  { label: 'PARTIAL', value: 'PARTIAL' },
  { label: 'CREDIT / UNPAID', value: 'CREDIT' },
];

export const VendorPurchaseList: React.FC<VendorPurchaseListProps> = ({
  purchases,
  onPayPurchase,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter purchases
  const filteredPurchases = purchases.filter(p => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchInvoice = p.invoiceNo.toLowerCase().includes(q);
      const matchItem = p.items.some(it => it.productName.toLowerCase().includes(q));
      if (!matchInvoice && !matchItem) return false;
    }

    if (statusFilter !== 'ALL' && p.paymentStatus !== statusFilter) {
      return false;
    }

    return true;
  });

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

  return (
    <View style={styles.container}>
      {/* Search & Filter Bar */}
      <View style={styles.filterBar}>
        <View style={{ flex: 2 }}>
          <Input
            placeholder="Search Invoice # or Item..."
            value={search}
            onChangeText={setSearch}
            icon="search-outline"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            options={PAYMENT_STATUS_OPTIONS}
            value={statusFilter}
            onSelect={setStatusFilter}
          />
        </View>
      </View>

      {/* Purchase List */}
      <FlatList
        data={filteredPurchases}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No purchases found matching criteria.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            style={[styles.itemCard, { borderColor: colors.border }]}
            onPress={() => {
              navigation.navigate(ROUTES.MAIN.PURCHASE as any, {
                screen: ROUTES.PURCHASE_SCREENS.DETAILS,
                params: { id: item.id },
              });
            }}
          >
            <View style={styles.itemHeader}>
              <View>
                <Text style={[styles.invoiceNo, { color: colors.text }]}>
                  {item.invoiceNo}
                </Text>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {dayjs(item.orderDate).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {renderBadge(item.paymentStatus || 'CREDIT')}
                <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                  {item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}
                </Text>
              </View>
            </View>

            {/* Line items preview */}
            <View style={[styles.itemsBox, { backgroundColor: colors.surfaceHover }]}>
              {item.items.map((it, idx) => (
                <Text key={idx} style={[styles.itemLine, { color: colors.text }]} numberOfLines={1}>
                  • {it.productName} ({it.quantity} × ₹{it.unitCost}) = ₹{it.subtotal.toLocaleString('en-IN')}
                </Text>
              ))}
            </View>

            {/* Amounts Row */}
            <View style={styles.amountsRow}>
              <View style={styles.amountCol}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total</Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  ₹{item.totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.amountCol}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Paid</Text>
                <Text style={[styles.amountValue, { color: colors.success }]}>
                  ₹{(item.paidAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.amountCol}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Due</Text>
                <Text
                  style={[
                    styles.amountValue,
                    { color: (item.dueAmount || 0) > 0 ? colors.danger : colors.textSecondary },
                  ]}
                >
                  ₹{(item.dueAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              {(item.dueAmount || 0) > 0 && onPayPurchase && (
                <Button
                  variant="outline"
                  size="small"
                  onPress={() => onPayPurchase(item)}
                  style={{ alignSelf: 'center', marginLeft: 'auto' }}
                >
                  Pay Due
                </Button>
              )}
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
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
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
  itemCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNo: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
  },
  itemCount: {
    fontSize: 11,
  },
  itemsBox: {
    padding: spacing.xs + 2,
    borderRadius: 6,
    marginVertical: spacing.xs,
    gap: 2,
  },
  itemLine: {
    fontSize: 11.5,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  amountCol: {
    flexDirection: 'column',
  },
  amountLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default VendorPurchaseList;
