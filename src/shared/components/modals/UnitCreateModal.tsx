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
import { useCreateUnit } from '../../../features/inventory/hooks/useInventory';
import { spacing } from '../../theme/themes';

const unitSchema = z.object({
  name: z.string().min(1, 'Unit Name is required'),
  shortCode: z.string().min(1, 'Short Code is required'),
  type: z.string().min(1, 'Unit Type is required'),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (unitShortCode: string) => void;
  initialName?: string;
}

export const UnitCreateModal: React.FC<UnitCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialName = '',
}) => {
  const { colors } = useTheme();
  const createMutation = useCreateUnit();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema) as any,
    defaultValues: {
      name: initialName,
      shortCode: '',
      type: 'Weight',
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        name: initialName,
        shortCode: '',
        type: 'Weight',
      });
    }
  }, [visible, initialName]);

  const onSubmit = (values: UnitFormValues) => {
    createMutation.mutate(
      {
        name: values.name.trim(),
        shortCode: values.shortCode.trim(),
        type: values.type,
      },
      {
        onSuccess: (data) => {
          if (onSuccess) onSuccess(data.shortCode);
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create New Unit of Measure">
      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Unit Name *"
              placeholder="e.g. Kilogram, Liters, Pieces"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="shortCode"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Short Code *"
              placeholder="e.g. Kg, L, pcs, box"
              value={value}
              onChangeText={onChange}
              error={errors.shortCode?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Unit Type *"
              options={[
                { label: 'Weight (e.g. Kg, g)', value: 'Weight' },
                { label: 'Volume (e.g. L, ml)', value: 'Volume' },
                { label: 'Count (e.g. pcs, tray, bag)', value: 'Count' },
                { label: 'Other', value: 'Other' },
              ]}
              selectedValue={value}
              onValueChange={onChange}
              error={errors.type?.message}
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
            title="Save Unit"
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

export default UnitCreateModal;
