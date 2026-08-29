import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateWaste, useWasteReasons } from '../hooks/useWaste';
import CreatableSelect from '../../../shared/components/ui/CreatableSelect';
import IngredientCreateModal from '../../../shared/components/modals/IngredientCreateModal';
import WasteReasonCreateModal from '../../../shared/components/modals/WasteReasonCreateModal';
import { useAllProductsRaw } from '../../inventory/hooks/useInventory';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { ROUTES } from '../../../shared/constants/routes';
import { WasteStackParamList } from '../../../app/navigation/types';

const wasteSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

type WasteFormValues = z.infer<typeof wasteSchema>;
type NavigationProp = NativeStackNavigationProp<WasteStackParamList>;

export const WasteEntryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const createMutation = useCreateWaste();
  const { data: products } = useAllProductsRaw();
  const { data: reasonsData = [] } = useWasteReasons();

  // Modals visibility states
  const [ingModalVisible, setIngModalVisible] = React.useState(false);
  const [reasonModalVisible, setReasonModalVisible] = React.useState(false);
  const [typedIngredientName, setTypedIngredientName] = React.useState('');
  const [typedReasonName, setTypedReasonName] = React.useState('');

  const {
    control,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<WasteFormValues>({
    resolver: zodResolver(wasteSchema) as any,
    defaultValues: {
      productId: '',
      quantity: 1,
      reason: 'Spoiled',
      notes: '',
    },
  });

  const watchedProductId = watch('productId');
  const selectedProd = products?.find(p => p.id === watchedProductId);

  const onSubmit = (values: WasteFormValues) => {
    // Perform manual stock level checks before logging
    const prod = products?.find((p) => p.id === values.productId);
    if (prod && prod.currentStock < values.quantity) {
      setError('quantity', {
        type: 'manual',
        message: `Exceeds stock. Available: ${prod.currentStock} ${prod.unit}`,
      });
      return;
    }

    createMutation.mutate({
      productId: values.productId,
      quantity: Number(values.quantity),
      reason: values.reason,
      notes: values.notes || '',
    }, {
      onSuccess: () => {
        navigation.navigate(ROUTES.WASTE_SCREENS.LIST as any);
      },
    });
  };

  const productOptions = (products || []).map((p) => ({
    label: `${p.name} (Avail: ${p.currentStock} ${p.unit})`,
    value: p.id,
  }));

  const reasonOptions = reasonsData.map((r) => ({
    label: r.name,
    value: r.name,
  }));

  return (
    <ScreenContainer title="Log Spoilage / Waste">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Waste Details</Text>
          
          <Controller
            control={control}
            name="productId"
            render={({ field: { onChange, value } }) => (
              <CreatableSelect
                label="Ingredient Product"
                placeholder="Select Ingredient Product *"
                options={productOptions}
                selectedValue={value}
                onValueChange={onChange}
                onCreate={(search) => {
                  setTypedIngredientName(search);
                  setIngModalVisible(true);
                }}
                createLabel="+ Add New Ingredient"
                error={errors.productId?.message}
              />
            )}
          />

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={selectedProd ? `Quantity Lost (${selectedProd.unit}) *` : 'Quantity Lost *'}
                    keyboardType="numeric"
                    value={String(value)}
                    onChangeText={onChange}
                    error={errors.quantity?.message}
                  />
                )}
              />
            </View>
            <View style={styles.formCol}>
              <Controller
                control={control}
                name="reason"
                render={({ field: { onChange, value } }) => (
                  <CreatableSelect
                    label="Waste Reason Category"
                    placeholder="Select Waste Reason *"
                    options={reasonOptions}
                    selectedValue={value}
                    onValueChange={onChange}
                    onCreate={(search) => {
                      setTypedReasonName(search);
                      setReasonModalVisible(true);
                    }}
                    createLabel="+ Add New Reason"
                    error={errors.reason?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Loss Notes"
                placeholder="Remarks e.g., Freezer breakdown overnight, milk soured"
                multiline
                numberOfLines={3}
                value={value || ''}
                onChangeText={onChange}
                style={styles.notesInput}
              />
            )}
          />

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Button
            title="Log Loss Entry"
            onPress={handleSubmit(onSubmit as any)}
            loading={createMutation.isPending}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>

      <IngredientCreateModal
        visible={ingModalVisible}
        onClose={() => setIngModalVisible(false)}
        initialName={typedIngredientName}
        onSuccess={(productId) => setValue('productId', productId)}
      />

      <WasteReasonCreateModal
        visible={reasonModalVisible}
        onClose={() => setReasonModalVisible(false)}
        initialName={typedReasonName}
        onSuccess={(reasonName) => setValue('reason', reasonName)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollBody: {
    padding: spacing.md,
  },
  formCard: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  formCol: {
    flex: 1,
    minWidth: 180,
    paddingHorizontal: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
    height: 40,
  },
});

export default WasteEntryScreen;
