import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Modal from '../../../shared/components/ui/Modal';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Vendor, MakePaymentPayload } from '../types/vendor.types';
import { Purchase } from '../../../shared/mock/mockDb';

import DatePicker from '../../../shared/components/ui/DatePicker';

interface VendorPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  vendor: Vendor;
  selectedPurchase?: Purchase | null;
  onSubmit: (payload: MakePaymentPayload) => Promise<void>;
  loading?: boolean;
}

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'Cash' },
  { label: 'UPI (PhonePe / GPay / Paytm)', value: 'UPI' },
  { label: 'Bank Transfer (NEFT / RTGS / IMPS)', value: 'Bank Transfer' },
  { label: 'Card (Debit / Credit)', value: 'Card' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Other', value: 'Other' },
];

export const VendorPaymentModal: React.FC<VendorPaymentModalProps> = ({
  visible,
  onClose,
  vendor,
  selectedPurchase,
  onSubmit,
  loading = false,
}) => {
  const { colors } = useTheme();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<any>('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const previousDue = selectedPurchase
    ? selectedPurchase.dueAmount || 0
    : vendor.outstanding || 0;

  useEffect(() => {
    if (visible) {
      if (selectedPurchase && selectedPurchase.dueAmount) {
        setAmount(String(selectedPurchase.dueAmount));
      } else if (vendor.outstanding) {
        setAmount(String(vendor.outstanding));
      } else {
        setAmount('');
      }
      setPaymentMethod('Cash');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReference('');
      setNotes('');
      setError('');
    }
  }, [visible, selectedPurchase, vendor]);

  const numAmount = Number(amount) || 0;
  const remainingDue = Math.max(0, previousDue - numAmount);

  const handleSave = async () => {
    if (numAmount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }
    if (numAmount > previousDue) {
      setError(`Payment amount cannot exceed outstanding due of ₹${previousDue.toLocaleString('en-IN')}`);
      return;
    }
    setError('');

    try {
      await onSubmit({
        vendorId: vendor.id,
        purchaseId: selectedPurchase?.id,
        invoiceNo: selectedPurchase?.invoiceNo,
        amount: numAmount,
        paymentMethod,
        date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Failed to process payment');
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Make Vendor Payment">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Context Summary Box */}
        <View style={[styles.summaryBox, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
          <Text style={[styles.firmTitle, { color: colors.text }]}>{vendor.firmName}</Text>
          {selectedPurchase ? (
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
              Invoice: <Text style={{ color: colors.text, fontWeight: '600' }}>{selectedPurchase.invoiceNo}</Text>
            </Text>
          ) : (
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>General Account Payment</Text>
          )}
        </View>

        {/* Calculation Preview Card */}
        <View style={[styles.calcBox, { borderColor: colors.border }]}>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Previous Outstanding Due</Text>
            <Text style={[styles.calcValue, { color: colors.danger }]}>
              ₹{previousDue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Payment Amount</Text>
            <Text style={[styles.calcValue, { color: colors.success }]}>
              - ₹{numAmount.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.calcDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabelBold, { color: colors.text }]}>Remaining Due</Text>
            <Text style={[styles.calcValueBold, { color: remainingDue > 0 ? colors.danger : colors.success }]}>
              ₹{remainingDue.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <Input
          label="Payment Amount (₹) *"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          error={error}
        />

        <Select
          label="Payment Method *"
          options={PAYMENT_METHODS}
          value={paymentMethod}
          onSelect={setPaymentMethod}
        />

        <DatePicker
          label="Payment Date *"
          value={paymentDate}
          onChange={setPaymentDate}
        />

        <Input
          label="Payment Reference / Transaction ID (Optional)"
          placeholder="e.g. UTR9812739182 / Cash Slip #"
          value={reference}
          onChangeText={setReference}
        />

        <Input
          label="Notes / Remarks (Optional)"
          placeholder="e.g. Advance payment towards September orders"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />

        <View style={[styles.actions, { borderTopColor: colors.divider }]}>
          <Button variant="outline" onPress={onClose} disabled={loading} style={styles.actionBtn}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} loading={loading} style={styles.actionBtn}>
            Save Payment
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
  summaryBox: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  firmTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  calcBox: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginVertical: spacing.xs,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 12,
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  calcDivider: {
    height: 1,
    marginVertical: 4,
  },
  calcLabelBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcValueBold: {
    fontSize: 14,
    fontWeight: '700',
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

export default VendorPaymentModal;
