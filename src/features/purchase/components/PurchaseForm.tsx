import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { useVendors } from '../hooks/usePurchases';
import { useAllProductsRaw } from '../../inventory/hooks/useInventory';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../../shared/utils/formatters';
import CreatableSelect from '../../../shared/components/ui/CreatableSelect';
import IngredientCreateModal from '../../../shared/components/modals/IngredientCreateModal';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Qty must be positive'),
  unitCost: z.coerce.number().positive('Cost must be positive'),
});

const purchaseSchema = z.object({
  invoiceNo: z.string().optional(),
  vendorId: z.string().optional(),
  orderDate: z.string().min(1, 'Order Date is required'),
  deliveryDate: z.string().optional(),
  status: z.enum(['Draft', 'Submitted']),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one line item is required'),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  initialValues?: Partial<PurchaseFormValues>;
  onSubmit: (values: PurchaseFormValues) => void;
  loading?: boolean;
  isEdit?: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  isEdit = false,
}) => {
  const { colors } = useTheme();
  const { data: vendors } = useVendors();
  const { data: products } = useAllProductsRaw();
  const fileInputRef = useRef<any>(null);

  const [ingModalVisible, setIngModalVisible] = useState(false);
  const [typedProductName, setTypedProductName] = useState('');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const handleFileChange = (e: any, onChange: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      invoiceNo: '',
      vendorId: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      status: 'Draft',
      notes: '',
      photoUrl: '',
      items: [{ productId: '', quantity: 1, unitCost: 1.0 }],
      ...initialValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedVendorId = watch('vendorId');

  // Compute overall total invoice amount
  const calculateTotalAmount = () => {
    return watchedItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const c = Number(item.unitCost) || 0;
      return sum + (q * c);
    }, 0);
  };

  const productOptions = (products || []).map((p) => ({
    label: `${p.name} (${p.sku})`,
    value: p.id,
  }));

  const vendorOptions = (vendors || []).map((v) => ({
    label: v.name,
    value: v.id,
  }));

  // Auto-fill unit cost when a product is selected
  const handleProductChange = (index: number, prodId: string) => {
    setValue(`items.${index}.productId` as any, prodId);
    const selectedProd = products?.find((p) => p.id === prodId);
    if (selectedProd) {
      setValue(`items.${index}.unitCost` as any, selectedProd.purchaseCost);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollBody}>
      <Card style={styles.formCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Details</Text>
        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Controller
              control={control}
              name="orderDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Purchase Date *"
                  value={value}
                  onChange={onChange}
                  error={errors.orderDate?.message}
                />
              )}
            />
          </View>
          <View style={styles.formCol}>
            <Controller
              control={control}
              name="deliveryDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Expected Delivery Date"
                  value={value || ''}
                  onChange={onChange}
                  error={errors.deliveryDate?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Controller
              control={control}
              name="photoUrl"
              render={({ field: { onChange, value } }) => {
                const triggerUpload = () => {
                  if (Platform.OS === 'web') {
                    fileInputRef.current?.click();
                  } else {
                    onChange('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&q=80');
                  }
                };

                return (
                  <View style={styles.uploadWrapper}>
                    <Text style={[styles.uploadLabel, { color: colors.textSecondary }]}>Invoice Photo Attachment</Text>
                    {Platform.OS === 'web' && (
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e, onChange)}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    )}
                    {value ? (
                      <View style={[styles.previewContainer, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
                        <Image source={{ uri: value }} style={styles.previewImage} resizeMode="cover" />
                        <View style={styles.previewDetails}>
                          <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={1}>
                            Invoice Photo Uploaded
                          </Text>
                          <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
                            Ready to save
                          </Text>
                        </View>
                        <Button
                          title="Remove"
                          onPress={() => onChange('')}
                          variant="outline"
                          size="sm"
                          style={styles.removePhotoBtn}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={triggerUpload}
                      >
                        <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                        <Text style={[styles.uploadText, { color: colors.text }]}>Upload Invoice Photo</Text>
                        <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>Supports PNG, JPG, JPEG (Max 5MB)</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        {/* Dynamic Line Items Section */}
        <View style={styles.lineItemsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Line items *</Text>
          <Button
            title="+ Add Item"
            onPress={() => append({ productId: '', quantity: 1, unitCost: 1.0 })}
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
            const subtotal = (Number(currentItem?.quantity) || 0) * (Number(currentItem?.unitCost) || 0);

            return (
              <View key={field.id} style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
                <View style={styles.itemProdCol}>
                  <Controller
                    control={control}
                    name={`items.${index}.productId`}
                    render={({ field: { value } }) => (
                      <CreatableSelect
                        label="Product"
                        options={productOptions}
                        selectedValue={value}
                        onValueChange={(val) => handleProductChange(index, val)}
                        onCreate={(search) => {
                          setTypedProductName(search);
                          setActiveItemIndex(index);
                          setIngModalVisible(true);
                        }}
                        createLabel="+ Add New Ingredient"
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
                        label="Quantity"
                        keyboardType="numeric"
                        value={String(value)}
                        onChangeText={onChange}
                        error={errors.items?.[index]?.quantity?.message}
                      />
                    )}
                  />
                </View>

                <View style={styles.itemCostCol}>
                  <Controller
                    control={control}
                    name={`items.${index}.unitCost`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Unit Cost"
                        keyboardType="numeric"
                        value={String(value)}
                        onChangeText={onChange}
                        error={errors.items?.[index]?.unitCost?.message}
                      />
                    )}
                  />
                </View>

                <View style={styles.itemSubtotalCol}>
                  <Text style={[styles.subtotalLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.subtotalVal, { color: colors.text }]} numberOfLines={1}>
                    {formatCurrency(subtotal)}
                  </Text>
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

        {/* Bottom controls */}
        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Internal Store Notes"
                  placeholder="Describe order exceptions or shipment logs"
                  multiline
                  numberOfLines={3}
                  value={value || ''}
                  onChangeText={onChange}
                  style={styles.notesInput}
                />
              )}
            />
          </View>

          <View style={styles.summaryCol}>
            <View style={[styles.summaryBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>Invoice Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Items:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{watchedItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Grand Total:</Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontSize: 16, fontWeight: '700' }]}>
                  {formatCurrency(calculateTotalAmount())}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.actionButtons}>
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View style={styles.statusSelectWrapper}>
                <Select
                  label="Save Mode"
                  options={[
                    { label: 'Save as Draft', value: 'Draft' },
                    { label: 'Submit & Restock Inventory', value: 'Submitted' },
                  ]}
                  selectedValue={value}
                  onValueChange={onChange}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            )}
          />

          <Button
            title={isEdit ? 'Update Purchase' : 'Create Purchase'}
            onPress={handleSubmit(onSubmit as any)}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </Card>

      <IngredientCreateModal
        visible={ingModalVisible}
        onClose={() => setIngModalVisible(false)}
        initialName={typedProductName}
        onSuccess={(productId) => {
          if (activeItemIndex !== null) {
            handleProductChange(activeItemIndex, productId);
          }
        }}
      />
    </ScrollView>
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
    minWidth: 200,
    paddingHorizontal: spacing.sm,
  },
  summaryCol: {
    flex: 1,
    minWidth: 200,
    paddingHorizontal: spacing.sm,
    justifyContent: 'flex-end',
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
    flex: 2,
    minWidth: 200,
  },
  itemQtyCol: {
    flex: 0.8,
    minWidth: 80,
  },
  itemCostCol: {
    flex: 0.8,
    minWidth: 80,
  },
  itemSubtotalCol: {
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
    paddingBottom: spacing.sm,
  },
  subtotalLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  subtotalVal: {
    fontSize: 13,
    fontWeight: '600',
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
  summaryBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statusSelectWrapper: {
    width: 250,
  },
  submitButton: {
    flex: 1,
    minWidth: 180,
    height: 40,
  },
  uploadWrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  uploadLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  uploadSubtext: {
    fontSize: 11,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  previewDetails: {
    flex: 1,
    gap: 2,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewSubtitle: {
    fontSize: 11,
  },
  removePhotoBtn: {
    height: 32,
    paddingHorizontal: spacing.sm,
  },
});

export default PurchaseForm;
