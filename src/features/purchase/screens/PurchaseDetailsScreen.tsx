import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, TouchableOpacity } from '@/web/primitives';
import { useRoute, useNavigation, RouteProp } from '@/web/navigation';
import { NativeStackNavigationProp } from '@/web/navigation';
import { usePurchaseById, useUpdatePurchase } from '../hooks/usePurchases';
import { useVendorDetails, useMakeVendorPayment } from '../../vendor/hooks/useVendors';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import VendorPaymentModal from '../../vendor/components/VendorPaymentModal';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { ROUTES } from '../../../shared/constants/routes';
import { useAllProductsRaw } from '../../inventory/hooks/useInventory';
import { Ionicons } from '@/web/icons';

type RoutePropType = RouteProp<PurchaseStackParamList, 'PurchaseDetails'>;
type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const PurchaseDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavigationProp>();
  const { id } = route.params;

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const { data: purchase, isLoading, isError, refetch } = usePurchaseById(id);
  const { data: vendor } = useVendorDetails(purchase?.vendorId || '');
  const { data: products = [] } = useAllProductsRaw();
  const updateMutation = useUpdatePurchase(id);
  const makePaymentMutation = useMakeVendorPayment();

  const getProductUnit = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    return prod?.unit || 'Kg';
  };

  const handleSubmitDraft = () => {
    updateMutation.mutate({ status: 'Submitted' });
  };

  const getPaymentBadgeType = (status?: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIAL':
        return 'warning';
      case 'CREDIT':
      default:
        return 'danger';
    }
  };

  const handleMakePaymentSubmit = async (payload: any) => {
    await makePaymentMutation.mutateAsync(payload);
    refetch();
  };

  if (isLoading) {
    return (
      <ScreenContainer title="Invoice Details">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading invoice details...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !purchase) {
    return (
      <ScreenContainer title="Invoice Details">
        <ErrorState
          message="Could not load the requested purchase order details."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  const paymentRecords = purchase.paymentHistory || [];

  return (
    <ScreenContainer title={`Invoice: ${purchase.invoiceNo}`}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title={`Purchase Invoice: ${purchase.invoiceNo}`}
          subtitle={`Managed and stored in branch directory`}
          onBack={() => navigation.goBack()}
          primaryAction={Platform.OS === 'web' ? {
            title: '🖨 Print Invoice',
            onPress: () => window.print(),
          } : undefined}
        />

        <View style={styles.contentGrid}>
          {/* Left Column: Vendor, Order Summary, Payment Cards */}
          <View style={styles.leftCol}>
            {/* Vendor Information Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="business-outline" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Vendor / Supplier</Text>
                </View>
                {vendor?.id && (
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate(ROUTES.MAIN.VENDORS, {
                      screen: ROUTES.VENDORS_SCREENS.DETAILS,
                      params: { id: vendor.id },
                    })}
                  >
                    <Text style={[styles.linkText, { color: colors.primary }]}>View Supplier Profile →</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Firm Name</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (purchase.vendorId) {
                        (navigation as any).navigate(ROUTES.MAIN.VENDORS, {
                          screen: ROUTES.VENDORS_SCREENS.DETAILS,
                          params: { id: purchase.vendorId },
                        });
                      }
                    }}
                  >
                    <Text style={[styles.detailVal, { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }]}>
                      {vendor?.firmName || purchase.vendorName}
                    </Text>
                  </TouchableOpacity>
                </View>
                {vendor?.contactPerson ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Contact Person</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>{vendor.contactPerson}</Text>
                  </View>
                ) : null}
                {vendor?.phone ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>{vendor.phone}</Text>
                  </View>
                ) : null}
                {vendor?.gstin ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>GSTIN / Tax ID</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>{vendor.gstin}</Text>
                  </View>
                ) : null}
                {vendor?.address ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                    <Text style={[styles.detailVal, { color: colors.textSecondary, maxWidth: 200 }]} numberOfLines={2}>
                      {vendor.address}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>

            {/* Order Details & Summary Card */}
            <Card style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Details</Text>
              </View>
              
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Invoice Number</Text>
                  <Text style={[styles.detailVal, { color: colors.text, fontWeight: '600' }]}>{purchase.invoiceNo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Purchase Date</Text>
                  <Text style={[styles.detailVal, { color: colors.text }]}>{formatDate(purchase.orderDate, 'DD MMM YYYY')}</Text>
                </View>
                {purchase.deliveryDate ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Delivery Date</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>{formatDate(purchase.deliveryDate, 'DD MMM YYYY')}</Text>
                  </View>
                ) : null}
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Order Status</Text>
                  <Badge
                    label={purchase.status}
                    type={purchase.status === 'Submitted' ? 'success' : 'warning'}
                  />
                </View>
              </View>

              {purchase.notes ? (
                <View style={[styles.notesSection, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Store Notes</Text>
                  <Text style={[styles.notesText, { color: colors.text }]}>{purchase.notes}</Text>
                </View>
              ) : null}

              {purchase.photoUrl ? (
                <View style={styles.photoSection}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Invoice Photo</Text>
                  <Image source={{ uri: purchase.photoUrl }} style={styles.invoicePhoto} resizeMode="contain" />
                </View>
              ) : null}

              {purchase.status === 'Draft' && (
                <View style={styles.actionBtns}>
                  <Button
                    title="Modify Draft"
                    onPress={() => navigation.navigate(ROUTES.PURCHASE_SCREENS.EDIT, { id: purchase.id })}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Submit to Inventory"
                    onPress={handleSubmitDraft}
                    loading={updateMutation.isPending}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </Card>

            {/* Payment Summary & Make Payment Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="card-outline" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>
                </View>
                <Badge
                  label={purchase.paymentStatus || 'CREDIT'}
                  type={getPaymentBadgeType(purchase.paymentStatus)}
                />
              </View>

              <View style={[styles.paymentCalcBox, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Purchase Total:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text, fontWeight: '700' }]}>
                    {formatCurrency(purchase.totalAmount)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Paid:</Text>
                  <Text style={[styles.summaryValue, { color: colors.success, fontWeight: '700' }]}>
                    {formatCurrency(purchase.paidAmount || 0)}
                  </Text>
                </View>
                <View style={[styles.calcDivider, { backgroundColor: colors.divider }]} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: '700' }]}>Remaining Due:</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: (purchase.dueAmount || 0) > 0 ? colors.danger : colors.success,
                        fontSize: 16,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {formatCurrency(purchase.dueAmount || 0)}
                  </Text>
                </View>
              </View>

              {(purchase.dueAmount || 0) > 0 && (
                <Button
                  title="Make Payment"
                  icon="cash-outline"
                  onPress={() => setPaymentModalOpen(true)}
                  style={{ marginTop: spacing.sm }}
                />
              )}
            </Card>
          </View>

          {/* Right Column: Line Items & Payment History */}
          <View style={styles.rightCol}>
            {/* Line Items Card */}
            <Card style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="cart-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Purchased Line Items ({purchase.items.length})</Text>
              </View>
              
              <View style={[styles.tableHeader, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
                <Text style={[styles.colName, { color: colors.textSecondary }]}>Product / Ingredient</Text>
                <Text style={[styles.colQty, { color: colors.textSecondary }]}>Quantity</Text>
                <Text style={[styles.colCost, { color: colors.textSecondary }]}>Unit Cost</Text>
                <Text style={[styles.colSub, { color: colors.textSecondary }]}>Subtotal</Text>
              </View>

              {purchase.items.map((item, idx) => (
                <View key={`${item.productId}-${idx}`} style={[styles.tableRow, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.cellName, { color: colors.text }]} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.cellQty, { color: colors.textSecondary }]}>
                    {item.quantity} {getProductUnit(item.productId)}
                  </Text>
                  <Text style={[styles.cellCost, { color: colors.textSecondary }]}>
                    {formatCurrency(item.unitCost)}
                  </Text>
                  <Text style={[styles.cellSub, { color: colors.text, fontWeight: '600' }]}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              ))}

              <View style={[styles.totalSummaryRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Line Items Sum:</Text>
                <Text style={[styles.totalVal, { color: colors.text, fontWeight: '700' }]}>
                  {formatCurrency(purchase.totalAmount)}
                </Text>
              </View>
            </Card>

            {/* Payment History Card */}
            <Card style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment History</Text>
              </View>

              {paymentRecords.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>
                    No payments recorded for this invoice yet (Full Credit).
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  <View style={[styles.tableHeader, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
                    <Text style={[styles.colHistDate, { color: colors.textSecondary }]}>Payment Date</Text>
                    <Text style={[styles.colHistMethod, { color: colors.textSecondary }]}>Method</Text>
                    <Text style={[styles.colHistNotes, { color: colors.textSecondary }]}>Reference / Notes</Text>
                    <Text style={[styles.colHistAmount, { color: colors.textSecondary }]}>Amount</Text>
                  </View>

                  {paymentRecords.map((pm, idx) => (
                    <View key={pm.id || idx} style={[styles.tableRow, { borderBottomColor: colors.divider }]}>
                      <Text style={[styles.colHistDate, { color: colors.text }]}>
                        {formatDate(pm.date, 'DD MMM YYYY')}
                      </Text>
                      <Text style={[styles.colHistMethod, { color: colors.text }]}>
                        {pm.paymentMethod}
                      </Text>
                      <Text style={[styles.colHistNotes, { color: colors.textSecondary }]} numberOfLines={1}>
                        {pm.reference ? `${pm.reference} ` : ''}{pm.notes || '—'}
                      </Text>
                      <Text style={[styles.colHistAmount, { color: colors.success, fontWeight: '700' }]}>
                        {formatCurrency(pm.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Make Payment Modal */}
      {vendor && (
        <VendorPaymentModal
          visible={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          vendor={vendor}
          selectedPurchase={purchase}
          onSubmit={handleMakePaymentSubmit}
          loading={makePaymentMutation.isPending}
        />
      )}

      {/* Hidden Print Container for Individual Invoice */}
      {Platform.OS === 'web' && (
        <div id="print-area">
          <div style={{ fontFamily: 'Arial, sans-serif', padding: '24px', color: '#000', backgroundColor: '#fff' }}>
            <h1 style={{ textAlign: 'center', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>SANWARIYA RESTAURANT STORE ERP</h1>
            <h2 style={{ textAlign: 'center', margin: '4px 0 16px 0', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Purchase Invoice</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', borderBottom: '1px solid #000', paddingBottom: '12px' }}>
              <div>
                <div><strong>Invoice No:</strong> {purchase.invoiceNo}</div>
                <div><strong>Purchase Date:</strong> {formatDate(purchase.orderDate, 'DD MMM YYYY')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Supplier:</strong> {vendor?.firmName || purchase.vendorName}</div>
                {vendor?.phone && <div><strong>Phone:</strong> {vendor.phone}</div>}
                {vendor?.gstin && <div><strong>GSTIN:</strong> {vendor.gstin}</div>}
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 'bold' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Unit</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Unit Cost</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px 4px' }}>{item.productName}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{getProductUnit(item.productId)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{formatCurrency(item.unitCost)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px', gap: '4px' }}>
              <div><strong>Invoice Total:</strong> {formatCurrency(purchase.totalAmount)}</div>
              <div><strong>Amount Paid:</strong> {formatCurrency(purchase.paidAmount || 0)}</div>
              <div><strong style={{ fontSize: '14px', color: '#b91c1c' }}>Remaining Due:</strong> {formatCurrency(purchase.dueAmount || 0)}</div>
              <div><strong>Payment Status:</strong> {purchase.paymentStatus}</div>
            </div>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  leftCol: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  rightCol: {
    flex: 1.6,
    minWidth: 340,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsList: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 13,
  },
  notesSection: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  photoSection: {
    marginTop: spacing.xs,
    gap: 4,
  },
  invoicePhoto: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentCalcBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  calcDivider: {
    height: 1,
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 13,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  colName: { flex: 2, fontSize: 11, fontWeight: '600' },
  colQty: { flex: 0.9, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  colCost: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  colSub: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'right' },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cellName: { flex: 2, fontSize: 12 },
  cellQty: { flex: 0.9, fontSize: 12, textAlign: 'center' },
  cellCost: { flex: 1, fontSize: 12, textAlign: 'right' },
  cellSub: { flex: 1, fontSize: 12, textAlign: 'right' },

  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalVal: {
    fontSize: 14,
  },
  emptyHistoryBox: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  historyList: {
    marginTop: spacing.xs,
  },
  colHistDate: { flex: 1.2, fontSize: 11 },
  colHistMethod: { flex: 1, fontSize: 11 },
  colHistNotes: { flex: 1.8, fontSize: 11 },
  colHistAmount: { flex: 1, fontSize: 11, textAlign: 'right' },
});

export default PurchaseDetailsScreen;
