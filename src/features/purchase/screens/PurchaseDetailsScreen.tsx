import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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

type RoutePropType = RouteProp<PurchaseStackParamList, 'PurchaseDetails'>;
type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const PurchaseDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavigationProp>();
  const { id } = route.params;

  const { data: purchase, isLoading, isError, refetch } = usePurchaseById(id);
  const updateMutation = useUpdatePurchase(id);

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
        />

        <View style={styles.contentGrid}>
          {/* Main Info Card */}
          <Card style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary Header</Text>
            
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vendor Partner</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{purchase.vendorName}</Text>
              </View>
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
                  {item.quantity}
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  colName: { flex: 2, fontSize: 11, fontWeight: '600' },
  colQty: { flex: 0.6, fontSize: 11, fontWeight: '600', textAlign: 'center' },
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
  cellQty: { flex: 0.6, fontSize: 12, textAlign: 'center' },
  cellCost: { flex: 1, fontSize: 12, textAlign: 'right' },
  cellSub: { flex: 1, fontSize: 12, textAlign: 'right' },
});

export default PurchaseDetailsScreen;
