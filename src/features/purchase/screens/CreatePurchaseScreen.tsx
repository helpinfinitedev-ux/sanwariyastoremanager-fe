import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreatePurchase } from '../hooks/usePurchases';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PurchaseForm, { PurchaseFormValues } from '../components/PurchaseForm';
import { PurchaseStackParamList } from '../../../app/navigation/types';
import { ROUTES } from '../../../shared/constants/routes';

type NavigationProp = NativeStackNavigationProp<PurchaseStackParamList>;

export const CreatePurchaseScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const createMutation = useCreatePurchase();

  const handleFormSubmit = (values: PurchaseFormValues) => {
    // Reformat values for payload
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
