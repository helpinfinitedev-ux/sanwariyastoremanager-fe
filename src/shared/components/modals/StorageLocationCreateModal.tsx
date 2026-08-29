import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useCreateStorageLocation } from '../../../features/inventory/hooks/useInventory';
import { spacing } from '../../theme/themes';

const locationSchema = z.object({
  name: z.string().min(1, 'Location Name is required'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive']),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface StorageLocationCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (locationName: string) => void;
  initialName?: string;
}

export const StorageLocationCreateModal: React.FC<StorageLocationCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialName = '',
}) => {
  const { colors } = useTheme();
  const createMutation = useCreateStorageLocation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      name: initialName,
      description: '',
      status: 'Active',
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        name: initialName,
        description: '',
        status: 'Active',
      });
    }
  }, [visible, initialName]);

  const onSubmit = (values: LocationFormValues) => {
    createMutation.mutate(
      {
        name: values.name.trim(),
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
    <Modal visible={visible} onClose={onClose} title="Create New Storage Location">
      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Location Name *"
              placeholder="e.g. Dry Store, Cold Storage, Freezer"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              placeholder="e.g. Zone A shelves, walk-in chiller area"
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
            title="Save Location"
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

export default StorageLocationCreateModal;
