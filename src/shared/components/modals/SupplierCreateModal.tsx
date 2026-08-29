import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useCreateSupplier } from '../../../features/purchase/hooks/usePurchases';
import { spacing } from '../../theme/themes';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').or(z.string().length(0)),
  address: z.string().optional(),
  gstin: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (supplierId: string, supplierName: string) => void;
  initialName?: string;
}

export const SupplierCreateModal: React.FC<SupplierCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialName = '',
}) => {
  const { colors } = useTheme();
  const createMutation = useCreateSupplier();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      name: initialName,
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      paymentTerms: 'Net 30',
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        name: initialName,
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
        paymentTerms: 'Net 30',
      });
    }
  }, [visible, initialName]);

  const onSubmit = (values: SupplierFormValues) => {
    createMutation.mutate(
      {
        name: values.name.trim(),
        contactPerson: values.contactPerson || '',
        phone: values.phone || '',
        email: values.email || '',
        address: values.address || '',
        gstin: values.gstin || '',
        paymentTerms: values.paymentTerms || '',
      },
      {
        onSuccess: (data) => {
          if (onSuccess) onSuccess(data.id, data.name);
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create New Supplier / Vendor" containerStyle={styles.modalContent}>
      <ScrollView contentContainerStyle={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Supplier Name *"
              placeholder="e.g. Metro Cash & Carry"
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
              name="contactPerson"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Contact Person"
                  placeholder="e.g. John Smith"
                  value={value}
                  onChangeText={onChange}
                  error={errors.contactPerson?.message}
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="e.g. +1 555-0199"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="e.g. orders@metro.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="gstin"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="GSTIN / Tax ID"
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  value={value}
                  onChangeText={onChange}
                  error={errors.gstin?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="paymentTerms"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Payment Terms"
              placeholder="e.g. Net 30, COD, Net 15"
              value={value}
              onChangeText={onChange}
              error={errors.paymentTerms?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Supplier Address"
              placeholder="Full warehouse or billing address"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={2}
              style={styles.textArea}
              error={errors.address?.message}
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
            title="Save Supplier"
            onPress={handleSubmit(onSubmit as any)}
            style={styles.btn}
            loading={createMutation.isPending}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    maxWidth: 600,
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

export default SupplierCreateModal;
