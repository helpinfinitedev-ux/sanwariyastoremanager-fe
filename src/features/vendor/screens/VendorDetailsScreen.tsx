import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import Card from '../../../shared/components/ui/Card';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { useVendorDetails, useVendorLedger, useMakeVendorPayment } from '../hooks/useVendors';
import { usePurchases } from '../../purchase/hooks/usePurchases';
import VendorSummary from '../components/VendorSummary';
import VendorPurchaseList from '../components/VendorPurchaseList';
import VendorLedger from '../components/VendorLedger';
import VendorPaymentModal from '../components/VendorPaymentModal';
import { Purchase } from '../../../shared/mock/mockDb';

export const VendorDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { colors } = useTheme();
  const vendorId = route.params?.id;

  const { data: vendor, isLoading: isVendorLoading, isError: isVendorError } = useVendorDetails(vendorId);
  const { data: ledger, isLoading: isLedgerLoading } = useVendorLedger(vendorId);
  const { data: allPurchasesRes } = usePurchases({ pageSize: 100 });
  const makePaymentMutation = useMakeVendorPayment();

  const [activeTab, setActiveTab] = useState<'purchases' | 'ledger'>('purchases');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayPurchase, setSelectedPayPurchase] = useState<Purchase | null>(null);

  // Filter vendor purchases
  const purchaseList = allPurchasesRes?.data || [];
  const vendorPurchases = purchaseList.filter((p: Purchase) => p.vendorId === vendorId && p.status === 'Submitted');

  const handleOpenGeneralPayment = () => {
    setSelectedPayPurchase(null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPurchasePayment = (purchase: Purchase) => {
    setSelectedPayPurchase(purchase);
    setIsPaymentModalOpen(true);
  };

  const handleMakePaymentSubmit = async (payload: any) => {
    await makePaymentMutation.mutateAsync(payload);
    Alert.alert('Payment Recorded', `Successfully processed ₹${payload.amount.toLocaleString('en-IN')} payment!`);
  };

  if (isVendorLoading) return <LoadingSpinner message="Loading vendor details..." />;
  if (isVendorError || !vendor) return <ErrorState message="Vendor details not found." onRetry={() => navigation.goBack()} />;

  return (
    <ScreenContainer>
      <PageHeader
        title={vendor.firmName}
        subtitle={`Contact: ${vendor.name} • ${vendor.phone} • GST: ${vendor.gstin || 'N/A'}`}
        onBack={() => navigation.goBack()}
        action={
          <Button variant="primary" icon="cash-outline" onPress={handleOpenGeneralPayment}>
            Make Payment
          </Button>
        }
      />

      {/* Meta Address & Payment Terms Strip */}
      <Card style={[styles.infoCard, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            📍 Address: <Text style={{ color: colors.text }}>{vendor.address}</Text>
          </Text>
          <View style={styles.badgeRow}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Terms:</Text>
            <Badge label={vendor.paymentTerms} type="info" />
          </View>
        </View>
      </Card>

      {/* Financial Summary Cards */}
      <VendorSummary
        totalPurchase={vendor.totalPurchase || 0}
        totalPaid={vendor.totalPaid || 0}
        outstanding={vendor.outstanding || 0}
      />

      {/* Tab Segment Switcher */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('purchases')}
          style={[
            styles.tabItem,
            activeTab === 'purchases' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'purchases' ? colors.primary : colors.textSecondary },
              activeTab === 'purchases' && { fontWeight: '700' },
            ]}
          >
            Purchase History ({vendorPurchases.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('ledger')}
          style={[
            styles.tabItem,
            activeTab === 'ledger' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'ledger' ? colors.primary : colors.textSecondary },
              activeTab === 'ledger' && { fontWeight: '700' },
            ]}
          >
            Vendor Ledger Timeline
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'purchases' ? (
          <VendorPurchaseList
            purchases={vendorPurchases}
            onPayPurchase={handleOpenPurchasePayment}
          />
        ) : (
          <VendorLedger ledger={ledger || []} />
        )}
      </View>

      {/* Make Payment Modal */}
      <VendorPaymentModal
        visible={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        vendor={vendor}
        selectedPurchase={selectedPayPurchase}
        onSubmit={handleMakePaymentSubmit}
        loading={makePaymentMutation.isPending}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tabText: {
    fontSize: 13.5,
  },
  tabContent: {
    flex: 1,
  },
});

export default VendorDetailsScreen;
