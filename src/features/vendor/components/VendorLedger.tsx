import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Card from '../../../shared/components/ui/Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { VendorLedgerEntry } from '../types/vendor.types';
import { dayjs } from '../../../shared/utils/formatters';

interface VendorLedgerProps {
  ledger: VendorLedgerEntry[];
}

export const VendorLedger: React.FC<VendorLedgerProps> = ({ ledger }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* Table Header */}
      <View style={[styles.headerRow, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerCell, styles.dateCol, { color: colors.textSecondary }]}>Date</Text>
        <Text style={[styles.headerCell, styles.refCol, { color: colors.textSecondary }]}>Reference</Text>
        <Text style={[styles.headerCell, styles.amtCol, { color: colors.textSecondary }]}>Purchase</Text>
        <Text style={[styles.headerCell, styles.amtCol, { color: colors.textSecondary }]}>Payment</Text>
        <Text style={[styles.headerCell, styles.amtCol, { color: colors.textSecondary }]}>Balance</Text>
      </View>

      {/* Table Rows */}
      <FlatList
        data={ledger}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No ledger entries recorded for this vendor.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.divider }]}>
            <View style={styles.dateCol}>
              <Text style={[styles.cellText, { color: colors.text }]}>
                {dayjs(item.date).format('DD MMM YYYY')}
              </Text>
            </View>

            <View style={styles.refCol}>
              <Text style={[styles.refText, { color: colors.text }]} numberOfLines={1}>
                {item.reference}
              </Text>
              {item.notes ? (
                <Text style={[styles.subText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.notes}
                </Text>
              ) : null}
            </View>

            <View style={styles.amtCol}>
              <Text style={[styles.cellText, { color: item.purchaseAmount > 0 ? colors.text : colors.textSecondary }]}>
                {item.purchaseAmount > 0 ? `+₹${item.purchaseAmount.toLocaleString('en-IN')}` : '-'}
              </Text>
            </View>

            <View style={styles.amtCol}>
              <Text style={[styles.cellText, { color: item.paymentAmount > 0 ? colors.success : colors.textSecondary }]}>
                {item.paymentAmount > 0 ? `-₹${item.paymentAmount.toLocaleString('en-IN')}` : '-'}
              </Text>
            </View>

            <View style={styles.amtCol}>
              <Text style={[styles.balanceText, { color: item.balance > 0 ? colors.danger : colors.success }]}>
                ₹{item.balance.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  dateCol: {
    width: 100,
  },
  refCol: {
    flex: 2,
  },
  amtCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cellText: {
    fontSize: 12.5,
  },
  refText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  subText: {
    fontSize: 10.5,
    marginTop: 1,
  },
  balanceText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12.5,
  },
});

export default VendorLedger;
