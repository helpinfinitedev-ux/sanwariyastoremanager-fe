import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateIssue } from '../hooks/useKitchenIssues';
import { useAllProductsRaw } from '../../inventory/hooks/useInventory';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { KITCHEN_SECTIONS } from '../../../shared/mock/mockDb';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../../shared/constants/routes';
import { KitchenIssueStackParamList } from '../../../app/navigation/types';

const issueItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
});

const issueSchema = z.object({
  issuedToSection: z.string().min(1, 'Kitchen section is required'),
  notes: z.string().optional(),
  items: z.array(issueItemSchema).min(1, 'At least one ingredient must be issued'),
});

type IssueFormValues = z.infer<typeof issueSchema>;
type NavigationProp = NativeStackNavigationProp<KitchenIssueStackParamList>;

export const IssueStockScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const createMutation = useCreateIssue();
  const { data: products } = useAllProductsRaw();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema) as any,
    defaultValues: {
      issuedToSection: '',
      notes: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  const onSubmit = (values: IssueFormValues) => {
    // Perform manual stock level checks before mutation
    let hasError = false;
    values.items.forEach((item, index) => {
      const prod = products?.find((p) => p.id === item.productId);
      if (prod && prod.currentStock < item.quantity) {
        setError(`items.${index}.quantity` as any, {
          type: 'manual',
          message: `Exceeds stock. Available: ${prod.currentStock} ${prod.unit}`,
        });
        hasError = true;
      }
    });

    if (hasError) return;

    createMutation.mutate({
      issuedToSection: values.issuedToSection,
      issuedBy: 'Store Manager', // Simulated session user
      notes: values.notes || '',
      items: values.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    }, {
      onSuccess: () => {
        navigation.navigate(ROUTES.KITCHEN_ISSUE_SCREENS.LIST as any);
      },
    });
  };

  const productOptions = (products || []).map((p) => ({
    label: `${p.name} (Avail: ${p.currentStock} ${p.unit})`,
    value: p.id,
  }));

  const sectionOptions = KITCHEN_SECTIONS.map((sec: string) => ({
    label: sec,
    value: sec,
  }));

  return (
    <ScreenContainer title="Issue Stock to Kitchen">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dispatch Header</Text>
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Controller
                control={control}
                name="issuedToSection"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Recipient Kitchen Section *"
                    options={sectionOptions}
                    selectedValue={value}
                    onValueChange={onChange}
                    error={errors.issuedToSection?.message}
                  />
                )}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.lineItemsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Ingredients to Dispatch *
            </Text>
            <Button
              title="+ Add Ingredient"
              onPress={() => append({ productId: '', quantity: 1 })}
              variant="outline"
              size="sm"
            />
          </View>

          {errors.items?.message && (
            <Text style={[styles.errorMessage, { color: colors.danger }]}>
              {errors.items.message}
            </Text>
          )}

          <View style={styles.itemsWrapper}>
            {fields.map((field, index) => {
              const currentItem = watchedItems[index];
              const selectedProd = products?.find(p => p.id === currentItem?.productId);

              return (
                <View key={field.id} style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
                  <View style={styles.itemProdCol}>
                    <Controller
                      control={control}
                      name={`items.${index}.productId`}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          label="Select Ingredient"
                          options={productOptions}
                          selectedValue={value}
                          onValueChange={onChange}
                          error={errors.items?.[index]?.productId?.message}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.itemQtyCol}>
                    <Controller
                      control={control}
                      name={`items.${index}.quantity`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label={selectedProd ? `Quantity (${selectedProd.unit})` : 'Quantity'}
                          keyboardType="numeric"
                          value={String(value)}
                          onChangeText={onChange}
                          error={errors.items?.[index]?.quantity?.message}
                        />
                      )}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.dangerBg }]}
                    disabled={fields.length <= 1}
                    onPress={() => remove(index)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Dispatch Dispatch Notes"
                placeholder="Remarks e.g., Requested by Chef, Prep for evening buffet"
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
            title="Log Dispatch"
            onPress={handleSubmit(onSubmit as any)}
            loading={createMutation.isPending}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>
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
  },
  formCol: {
    flex: 1,
    maxWidth: 400,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorMessage: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  itemsWrapper: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  itemProdCol: {
    flex: 2.5,
    minWidth: 200,
  },
  itemQtyCol: {
    flex: 1,
    minWidth: 120,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
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

export default IssueStockScreen;
