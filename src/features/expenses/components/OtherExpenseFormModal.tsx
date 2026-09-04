import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from '@/web/primitives';
import Modal from '../../../shared/components/ui/Modal';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import DatePicker from '../../../shared/components/ui/DatePicker';
import Button from '../../../shared/components/ui/Button';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { OtherExpense, OtherExpenseFormInputs } from '../types/expenses.types';

interface OtherExpenseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: OtherExpenseFormInputs) => Promise<void>;
  initialData?: OtherExpense | null;
  loading?: boolean;
}



const PAYMENT_METHODS = [
  { label: 'Cash', value: 'Cash' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
  { label: 'Card', value: 'Card' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Other', value: 'Other' },
];

export const OtherExpenseFormModal: React.FC<OtherExpenseFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const { colors } = useTheme();

  const [category, setCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<any>('Cash');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || '');
      setAmount(String(initialData.amount || ''));
      setDate(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialData.paymentMethod || 'Cash');
      setRemark(initialData.remark || '');
    } else {
      setCategory('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setRemark('');
    }
    setError('');
    setCategoryError('');
  }, [initialData, visible]);

  const handleSave = async () => {
    let hasError = false;

    if (!category.trim()) {
      setCategoryError('Expense category is required.');
      hasError = true;
    } else {
      setCategoryError('');
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount');
      hasError = true;
    } else {
      setError('');
    }

    if (hasError) return;

    try {
      await onSubmit({
        category: category.trim(),
        amount: numAmount,
        date: new Date(date).toISOString(),
        paymentMethod,
        remark: remark.trim(),
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save expense');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Edit Expense' : 'Add Other Expense'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Input
          label="Expense Category *"
          placeholder="Enter expense category"
          value={category}
          onChangeText={(text: string) => {
            setCategory(text);
            if (text.trim()) setCategoryError('');
          }}
          error={categoryError}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Expense Amount (₹) *"
              placeholder="e.g. 5500"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              error={error}
            />
          </View>
          <View style={styles.col}>
            <DatePicker
              label="Expense Date *"
              value={date}
              onChange={setDate}
            />
          </View>
        </View>

        <Select
          label="Payment Method *"
          options={PAYMENT_METHODS}
          value={paymentMethod}
          onSelect={setPaymentMethod}
        />

        <Input
          label="Remarks (Optional)"
          placeholder="e.g. September electricity bill"
          value={remark}
          onChangeText={setRemark}
          multiline
          numberOfLines={2}
        />

        <View style={[styles.actions, { borderTopColor: colors.divider }]}>
          <Button variant="outline" onPress={onClose} disabled={loading} style={styles.actionBtn}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} loading={loading} style={styles.actionBtn}>
            {initialData ? 'Save Changes' : 'Save Expense'}
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  actionBtn: {
    minWidth: 110,
  },
});

export default OtherExpenseFormModal;
