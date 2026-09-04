import React from 'react';
import { View, StyleSheet, Text } from '@/web/primitives';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useCreateKitchen } from '../../../features/kitchen-issue/hooks/useKitchenIssues';
import { spacing } from '../../theme/themes';

const kitchenSchema = z.object({
  name: z.string().min(1, 'Kitchen Name is required'),
  kitchenType: z.string().min(1, 'Kitchen Type is required'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive']),
});

type KitchenFormValues = z.infer<typeof kitchenSchema>;

interface KitchenCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (kitchenName: string) => void;
  initialName?: string;
}

export const KitchenCreateModal: React.FC<KitchenCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialName = '',
}) => {
  const { colors } = useTheme();
  const createMutation = useCreateKitchen();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KitchenFormValues>({
    resolver: zodResolver(kitchenSchema) as any,
    defaultValues: {
      name: initialName,
      kitchenType: 'Preparation',
      description: '',
      status: 'Active',
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        name: initialName,
        kitchenType: 'Preparation',
        description: '',
        status: 'Active',
      });
    }
  }, [visible, initialName]);

  const onSubmit = (values: KitchenFormValues) => {
    createMutation.mutate(
      {
        name: values.name.trim(),
        kitchenType: values.kitchenType,
        description: values.description || '',
        status: values.status,
      },
      {
        onSuccess: (data) => {
          if (onSuccess) onSuccess(data.name);
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create New Kitchen Department">
      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Kitchen / Department Name *"
              placeholder="e.g. Hot Kitchen, Bakery, Main hot"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="kitchenType"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Kitchen Type *"
              options={[
                { label: 'Preparation (e.g. Prep Kitchen)', value: 'Preparation' },
                { label: 'Cooking (e.g. Hot Kitchen)', value: 'Cooking' },
                { label: 'Baking (e.g. Bakery)', value: 'Baking' },
                { label: 'Beverage (e.g. Bar)', value: 'Beverage' },
                { label: 'Service / Dining', value: 'Service' },
              ]}
              selectedValue={value}
              onValueChange={onChange}
              error={errors.kitchenType?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              placeholder="Internal section remarks"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Status *"
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
              selectedValue={value}
              onValueChange={onChange}
              error={errors.status?.message}
            />
          )}
        />

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.btn}
            disabled={createMutation.isPending}
          />
          <Button
            title="Save Kitchen"
            onPress={handleSubmit(onSubmit as any)}
            style={styles.btn}
            loading={createMutation.isPending}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: spacing.xs,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
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

export default KitchenCreateModal;
