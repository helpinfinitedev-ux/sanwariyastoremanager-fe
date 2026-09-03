import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreatePurchase, useVendors } from '../hooks/usePurchases';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import PurchaseForm, { PurchaseFormValues } from '../components/PurchaseForm';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { ROUTES } from '../../../shared/constants/routes';

type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const CreatePurchaseScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const createMutation = useCreatePurchase();
  const { data: vendors } = useVendors();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(ROUTES.PURCHASE_SCREENS.LIST as any);
    }
  };

  const handleFormSubmit = (values: PurchaseFormValues) => {
    const generatedInvoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const assignedVendorId = vendors && vendors.length > 0 ? vendors[0].id : 'v1';

    // Reformat values for payload
    const payload = {
      invoiceNo: generatedInvoiceNo,
      vendorId: values.vendorId || assignedVendorId,
      orderDate: values.orderDate,
      deliveryDate: '',
      status: values.status,
      paidAmount: Number(values.paidAmount) || 0,
      paymentMethod: values.paymentMethod || 'Cash',
      notes: '',
      photoUrl: values.photoUrl || '',
      items: values.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        // Go back to listing
        navigation.navigate(ROUTES.PURCHASE_SCREENS.LIST as any, { refresh: true });
      },
    });
  };

  return (
    <ScreenContainer title="Create Restock Invoice">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader
          title="Create Restock Invoice"
          onBack={handleBack}
        />
        <PurchaseForm
          onSubmit={handleFormSubmit}
          loading={createMutation.isPending}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CreatePurchaseScreen;
