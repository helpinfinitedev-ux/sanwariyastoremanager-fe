import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import CreatableSelect from '../ui/CreatableSelect';
import { useTheme } from '../../../app/providers/ThemeProvider';
import {
  useCategories,
  useUnits,
  useStorageLocations,
  useCreateProduct
} from '../../../features/inventory/hooks/useInventory';
import CategoryCreateModal from './CategoryCreateModal';
import UnitCreateModal from './UnitCreateModal';
import StorageLocationCreateModal from './StorageLocationCreateModal';
import { spacing } from '../../theme/themes';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Item Name is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  minStock: z.coerce.number().min(0, 'Min stock must be non-negative').optional(),
  purchaseCost: z.coerce.number().min(0, 'Default cost must be non-negative').optional(),
  brand: z.string().optional(),
  storageLocation: z.string().optional(),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

interface IngredientCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (productId: string, productName: string) => void;
  initialName?: string;
}

export const IngredientCreateModal: React.FC<IngredientCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialName = '',
}) => {
  const { colors } = useTheme();
  const createMutation = useCreateProduct();

  // Fetch options lists dynamically
  const { data: categories = [] } = useCategories();
  const { data: units = [] } = useUnits();
  const { data: storageLocations = [] } = useStorageLocations();

  // Child modal visibility states for inline nesting
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [locModalVisible, setLocModalVisible] = useState(false);

  // Pre-typed search keys to prefill child modals
  const [typedCatName, setTypedCatName] = useState('');
  const [typedUnitName, setTypedUnitName] = useState('');
  const [typedLocName, setTypedLocName] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema) as any,
    defaultValues: {
      name: initialName,
      category: '',
      unit: '',
      minStock: 10,
      purchaseCost: 0,
      brand: '',
      storageLocation: 'Dry Store',
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        name: initialName,
        category: '',
        unit: '',
        minStock: 10,
        purchaseCost: 0,
        brand: '',
        storageLocation: 'Dry Store',
      });
    }
  }, [visible, initialName]);

  const onSubmit = (values: IngredientFormValues) => {
    createMutation.mutate(
      {
        name: values.name.trim(),
        category: values.category,
        unit: values.unit,
        minStock: values.minStock,
        purchaseCost: values.purchaseCost,
        brand: values.brand?.trim() || 'Generic',
        storageLocation: values.storageLocation || 'Dry Store',
      },
      {
        onSuccess: (data) => {
          if (onSuccess) onSuccess(data.id, data.name);
          onClose();
        },
      }
    );
  };

  // Maps arrays to select options
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.name }));
  const unitOptions = units.map((u) => ({ label: `${u.name} (${u.shortCode})`, value: u.shortCode }));
  const locationOptions = storageLocations.map((l) => ({ label: l.name, value: l.name }));

  return (
    <Modal visible={visible} onClose={onClose} title="Create New Ingredient Item" containerStyle={styles.modalContent}>
      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Item Name *"
              placeholder="e.g. Tomato, Raw Sugar, Premium Ghee"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <CreatableSelect
                  label="Category"
                  placeholder="Select Category *"
                  options={categoryOptions}
                  selectedValue={value}
                  onValueChange={onChange}
                  onCreate={(search) => {
                    setTypedCatName(search);
                    setCatModalVisible(true);
                  }}
                  createLabel="+ Add New Category"
                  error={errors.category?.message}
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, value } }) => (
                <CreatableSelect
                  label="Unit"
                  placeholder="Select Unit *"
                  options={unitOptions}
                  selectedValue={value}
                  onValueChange={onChange}
                  onCreate={(search) => {
                    setTypedUnitName(search);
                    setUnitModalVisible(true);
                  }}
                  createLabel="+ Add New Unit"
                  error={errors.unit?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="minStock"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Minimum Stock Level"
                  placeholder="e.g. 15"
                  keyboardType="numeric"
                  value={value !== undefined ? String(value) : ''}
                  onChangeText={onChange}
                  error={errors.minStock?.message}
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="purchaseCost"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Default Cost (₹)"
                  placeholder="e.g. 45"
                  keyboardType="numeric"
                  value={value !== undefined ? String(value) : ''}
                  onChangeText={onChange}
                  error={errors.purchaseCost?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Brand"
                  placeholder="Optional (e.g. Nestle, Amul)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.brand?.message}
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="storageLocation"
              render={({ field: { onChange, value } }) => (
                <CreatableSelect
                  label="Storage Location"
                  placeholder="Select Storage Location"
                  options={locationOptions}
                  selectedValue={value || ''}
                  onValueChange={onChange}
                  onCreate={(search) => {
                    setTypedLocName(search);
                    setLocModalVisible(true);
                  }}
                  createLabel="+ Add New Location"
                  error={errors.storageLocation?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.btn}
            disabled={createMutation.isPending}
          />
          <Button
            title="Save Ingredient"
            onPress={handleSubmit(onSubmit as any)}
            style={styles.btn}
            loading={createMutation.isPending}
          />
        </View>
      </ScrollView>

      {/* Nested Modals */}
      <CategoryCreateModal
        visible={catModalVisible}
        onClose={() => setCatModalVisible(false)}
        initialName={typedCatName}
        onSuccess={(catName) => setValue('category', catName)}
      />

      <UnitCreateModal
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        initialName={typedUnitName}
        onSuccess={(unitCode) => setValue('unit', unitCode)}
      />

      <StorageLocationCreateModal
        visible={locModalVisible}
        onClose={() => setLocModalVisible(false)}
        initialName={typedLocName}
        onSuccess={(locName) => setValue('storageLocation', locName)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    maxWidth: 600,
    maxHeight: '90%',
  },
  form: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btn: {
    minWidth: 100,
  },
});

export default IngredientCreateModal;
