import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePurchaseById, useUpdatePurchase } from '../hooks/usePurchases';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PurchaseForm, { PurchaseFormValues } from '../components/PurchaseForm';
import ErrorState from '../../../shared/components/feedback/ErrorState';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { ROUTES } from '../../../shared/constants/routes';

type RoutePropType = RouteProp<PurchaseStackParamList, 'EditPurchase'>;
type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const EditPurchaseScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { id } = route.params;

  const { data: purchase, isLoading, isError, refetch } = usePurchaseById(id);
  const updateMutation = useUpdatePurchase(id);

  const handleFormSubmit = (values: PurchaseFormValues) => {
    const payload = {
      invoiceNo: values.invoiceNo,
      vendorId: values.vendorId,
      orderDate: values.orderDate,
      deliveryDate: values.deliveryDate || '',
      status: values.status,
      notes: values.notes || '',
      items: values.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      })),
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        navigation.navigate(ROUTES.PURCHASE_SCREENS.LIST as any, { refresh: true });
      },
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer title="Edit Restock Invoice">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Fetching invoice details...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !purchase) {
    return (
      <ScreenContainer title="Edit Restock Invoice">
        <ErrorState
          message="Could not load the requested purchase order."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  // Preformat items list for form
  const initialFormValues: Partial<PurchaseFormValues> = {
    invoiceNo: purchase.invoiceNo,
    vendorId: purchase.vendorId,
    orderDate: purchase.orderDate ? purchase.orderDate.split('T')[0] : '',
    deliveryDate: purchase.deliveryDate ? purchase.deliveryDate.split('T')[0] : '',
    status: purchase.status,
    notes: purchase.notes,
    items: purchase.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
    })),
  };

  return (
    <ScreenContainer title="Edit Restock Invoice">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PurchaseForm
          initialValues={initialFormValues}
          onSubmit={handleFormSubmit}
          loading={updateMutation.isPending}
          isEdit={true}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default EditPurchaseScreen;
