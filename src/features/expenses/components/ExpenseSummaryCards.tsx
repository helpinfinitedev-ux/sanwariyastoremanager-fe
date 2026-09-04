import React from 'react';
import { View, Text, StyleSheet } from '@/web/primitives';
import Card from '../../../shared/components/ui/Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Ionicons } from '@/web/icons';

interface ExpenseSummaryCardsProps {
  ingredientTotal: number;
  otherTotal: number;
}

export const ExpenseSummaryCards: React.FC<ExpenseSummaryCardsProps> = ({
  ingredientTotal,
  otherTotal,
}) => {
  const { colors } = useTheme();
  const totalExpenses = ingredientTotal + otherTotal;

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="basket-outline" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Ingredient Purchases</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            ₹{ingredientTotal.toLocaleString('en-IN')}
          </Text>
        </View>
      </Card>

      <Card style={[styles.card, { borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.warningBg }]}>
          <Ionicons name="cash-outline" size={20} color={colors.warning} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Other Expenses</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            ₹{otherTotal.toLocaleString('en-IN')}
          </Text>
        </View>
      </Card>

      <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.dangerBg }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.danger} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary, fontWeight: '700' }]}>Total Expenses</Text>
          <Text style={[styles.value, { color: colors.danger, fontSize: 17 }]}>
            ₹{totalExpenses.toLocaleString('en-IN')}
          </Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default ExpenseSummaryCards;
