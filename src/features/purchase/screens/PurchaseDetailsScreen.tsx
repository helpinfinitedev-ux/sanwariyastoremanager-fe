import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePurchaseById, useUpdatePurchase } from '../hooks/usePurchases';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { ROUTES } from '../../../shared/constants/routes';
import { useAllProductsRaw } from '../../inventory/hooks/useInventory';

type RoutePropType = RouteProp<PurchaseStackParamList, 'PurchaseDetails'>;
type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const PurchaseDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavigationProp>();
  const { id } = route.params;

  const { data: purchase, isLoading, isError, refetch } = usePurchaseById(id);
  const { data: products = [] } = useAllProductsRaw();
  const updateMutation = useUpdatePurchase(id);

  const getProductUnit = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    return prod?.unit || 'Kg';
  };

  const handleSubmitDraft = () => {
    updateMutation.mutate({ status: 'Submitted' });
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

  return (
    <ScreenContainer title={`Invoice: ${purchase.invoiceNo}`}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title={`Purchase Invoice: ${purchase.invoiceNo}`}
          subtitle={`Managed and stored in branch directory`}
          primaryAction={Platform.OS === 'web' ? {
            title: '🖨 Print',
            onPress: () => window.print(),
          } : undefined}
        />

        <View style={styles.contentGrid}>
          {/* Main Info Card */}
          <Card style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary Header</Text>
            
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Order Date</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{formatDate(purchase.orderDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Delivery Status</Text>
                <Badge
                  label={purchase.status}
                  type={purchase.status === 'Submitted' ? 'success' : 'warning'}
                />
              </View>
              <View style={[styles.detailRow, styles.totalRow, { borderTopColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.text, fontWeight: '700' }]}>Invoice Total</Text>
                <Text style={[styles.detailVal, { color: colors.text, fontWeight: '700', fontSize: 16 }]}>
                  {formatCurrency(purchase.totalAmount)}
                </Text>
              </View>
            </View>

            {purchase.notes ? (
              <View style={styles.notesSection}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes</Text>
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
                  title="Modify Draft Invoice"
                  onPress={() => navigation.navigate(ROUTES.PURCHASE_SCREENS.EDIT, { id: purchase.id })}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Submit Invoice to Inventory"
                  onPress={handleSubmitDraft}
                  loading={updateMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </Card>

          {/* Line Items Card */}
          <Card style={styles.itemsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Line Item Details</Text>
            
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
              <Text style={[styles.colName, { color: colors.textSecondary }]}>Product</Text>
              <Text style={[styles.colQty, { color: colors.textSecondary }]}>Qty</Text>
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
                <Text style={[styles.cellSub, { color: colors.text, fontWeight: '500' }]}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* Hidden Print Container for Individual Invoice */}
      {Platform.OS === 'web' && (
        <div id="print-area">
          <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#000', backgroundColor: '#fff' }}>
            <h1 style={{ textAlign: 'center', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>RESTAURANT STORE ERP</h1>
            <h2 style={{ textAlign: 'center', margin: '5px 0 15px 0', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Purchase Invoice</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '13px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
              <div><strong>Invoice No:</strong> {purchase.invoiceNo}</div>
              <div><strong>Purchase Date:</strong> {formatDate(purchase.orderDate, 'DD MMM YYYY')}</div>
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
            
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px' }}>
              <div style={{ marginBottom: '5px' }}><strong>Total Quantity:</strong> {purchase.items.reduce((sum, i) => sum + i.quantity, 0)}</div>
              <div style={{ marginBottom: '5px' }}><strong>Subtotal:</strong> {formatCurrency(purchase.totalAmount)}</div>
              <div><strong style={{ fontSize: '14px', fontWeight: 'bold' }}>Total Amount:</strong> {formatCurrency(purchase.totalAmount)}</div>
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
  infoCard: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  itemsCard: {
    flex: 1.5,
    minWidth: 320,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  detailsList: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 13,
  },
  notesSection: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoSection: {
    marginTop: spacing.sm,
    gap: 4,
  },
  invoicePhoto: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  colName: { flex: 2, fontSize: 11, fontWeight: '600' },
  colQty: { flex: 0.8, fontSize: 11, fontWeight: '600', textAlign: 'center' },
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
  cellQty: { flex: 0.8, fontSize: 12, textAlign: 'center' },
  cellCost: { flex: 1, fontSize: 12, textAlign: 'right' },
  cellSub: { flex: 1, fontSize: 12, textAlign: 'right' },
});

export default PurchaseDetailsScreen;
