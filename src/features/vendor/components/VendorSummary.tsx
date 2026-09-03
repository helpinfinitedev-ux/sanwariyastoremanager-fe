import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../shared/components/ui/Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Ionicons } from '@expo/vector-icons';

interface VendorSummaryProps {
  totalPurchase: number;
  totalPaid: number;
  outstanding: number;
}

export const VendorSummary: React.FC<VendorSummaryProps> = ({
  totalPurchase,
  totalPaid,
  outstanding,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.iconBox}>
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Purchases</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            ₹{totalPurchase.toLocaleString('en-IN')}
          </Text>
        </View>
      </Card>

      <Card style={[styles.card, { borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.successBg }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Paid</Text>
          <Text style={[styles.value, { color: colors.success }]}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </Text>
        </View>
      </Card>

      <Card style={[styles.card, { borderColor: colors.border }]}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: outstanding > 0 ? colors.dangerBg : colors.surfaceHover },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={outstanding > 0 ? colors.danger : colors.textSecondary}
          />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Outstanding</Text>
          <Text
            style={[
              styles.value,
              { color: outstanding > 0 ? colors.danger : colors.textSecondary },
            ]}
          >
            ₹{outstanding.toLocaleString('en-IN')}
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
    backgroundColor: '#EBF5FF',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default VendorSummary;
