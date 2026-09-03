import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Ionicons } from '@expo/vector-icons';
import { Vendor } from '../types/vendor.types';

interface VendorCardProps {
  vendor: Vendor;
  onPress: () => void;
  onEdit?: () => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, onPress, onEdit }) => {
  const { colors } = useTheme();

  const totalPurchase = vendor.totalPurchase || 0;
  const totalPaid = vendor.totalPaid || 0;
  const outstanding = vendor.outstanding || 0;

  return (
    <Card style={[styles.card, { borderColor: colors.border }]} onPress={onPress}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleArea}>
          <Text style={[styles.firmName, { color: colors.text }]} numberOfLines={1}>
            {vendor.firmName}
          </Text>
          <Text style={[styles.vendorName, { color: colors.textSecondary }]} numberOfLines={1}>
            Contact: {vendor.name} • {vendor.phone}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Badge
            label={vendor.status}
            type={vendor.status === 'Active' ? 'success' : 'default'}
          />
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.metaRow}>
        {vendor.gstin ? (
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            GST: <Text style={{ color: colors.text, fontWeight: '600' }}>{vendor.gstin}</Text>
          </Text>
        ) : null}
        <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
          📍 {vendor.address}
        </Text>
      </View>

      {/* Financial Summary Strip */}
      <View style={[styles.statsStrip, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Purchase</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₹{totalPurchase.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Paid</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Outstanding</Text>
          <Text
            style={[
              styles.statValue,
              { color: outstanding > 0 ? colors.danger : colors.textSecondary },
            ]}
          >
            ₹{outstanding.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Footer Terms */}
      <View style={styles.footer}>
        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
          Terms: <Text style={{ color: colors.text }}>{vendor.paymentTerms}</Text>
        </Text>
        <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
          View Details →
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerTitleArea: {
    flex: 1,
  },
  firmName: {
    fontSize: 15,
    fontWeight: '700',
  },
  vendorName: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editBtn: {
    padding: 4,
  },
  metaRow: {
    marginVertical: spacing.xs,
    gap: 2,
  },
  metaText: {
    fontSize: 11.5,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  termsText: {
    fontSize: 11,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VendorCard;
