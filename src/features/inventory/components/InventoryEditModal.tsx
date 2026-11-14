import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from '@/web/primitives';
import Modal from '../../../shared/components/ui/Modal';
import Input from '../../../shared/components/ui/Input';
import CreatableSelect from '../../../shared/components/ui/CreatableSelect';
import Button from '../../../shared/components/ui/Button';
import CategoryCreateModal from '../../../shared/components/modals/CategoryCreateModal';
import { spacing } from '../../../shared/theme/themes';
import { Product } from '../../../shared/mock/mockDb';
import { useCategories, useUpdateProduct } from '../hooks/useInventory';

interface InventoryEditModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export const InventoryEditModal: React.FC<InventoryEditModalProps> = ({
  visible,
  product,
  onClose,
}) => {
  const { data: categories = [] } = useCategories();
  const updateMutation = useUpdateProduct();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [nameError, setNameError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (!visible || !product) return;
    setName(product.name);
    setCategory(product.category);
    setNameError('');
    setCategoryError('');
  }, [visible, product]);

  const handleClose = () => {
    if (updateMutation.isPending) return;
    setCategoryModalVisible(false);
    onClose();
  };

  const handleSave = () => {
    if (!product) return;

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const hasNameError = !trimmedName;
    const hasCategoryError = !trimmedCategory;

    setNameError(hasNameError ? 'Item name is required' : '');
    setCategoryError(hasCategoryError ? 'Category is required' : '');
    if (hasNameError || hasCategoryError) return;

    updateMutation.mutate(
      {
        id: product.id,
        data: { name: trimmedName, category: trimmedCategory },
      },
      { onSuccess: onClose },
    );
  };

  const categoryOptions = categories.map((item) => ({
    label: item.name,
    value: item.name,
  }));

  if (!product) return null;

  return (
    <Modal visible={visible} onClose={handleClose} title="Edit Inventory Item">
      <View style={styles.form}>
        <Input
          label="Item Name *"
          placeholder="Enter item name"
          value={name}
          onChangeText={(value: string) => {
            setName(value);
            if (value.trim()) setNameError('');
          }}
          error={nameError}
          disabled={updateMutation.isPending}
        />

        <CreatableSelect
          label="Category *"
          placeholder="Select a category"
          options={categoryOptions}
          selectedValue={category}
          onValueChange={(value) => {
            setCategory(value);
            setCategoryError('');
          }}
          onCreate={(value) => {
            setNewCategoryName(value);
            setCategoryModalVisible(true);
          }}
          createLabel="+ Add New Category"
          error={categoryError}
          disabled={updateMutation.isPending}
        />

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            disabled={updateMutation.isPending}
            style={styles.actionButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={updateMutation.isPending}
            style={styles.actionButton}
          />
        </View>
      </View>

      <CategoryCreateModal
        visible={categoryModalVisible}
        initialName={newCategoryName}
        onClose={() => setCategoryModalVisible(false)}
        onSuccess={(value) => {
          setCategory(value);
          setCategoryError('');
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    minWidth: 110,
  },
});

export default InventoryEditModal;
