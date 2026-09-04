import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from '@/web/primitives';
import Modal from '../../../shared/components/ui/Modal';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { Vendor, VendorFormInputs } from '../types/vendor.types';

interface VendorFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: VendorFormInputs) => Promise<void>;
  initialData?: Vendor | null;
  loading?: boolean;
}

const PAYMENT_TERMS_OPTIONS = [
  { label: 'Cash on Delivery', value: 'Cash on Delivery' },
  { label: '7 Days', value: '7 Days' },
  { label: '15 Days', value: '15 Days' },
  { label: '30 Days', value: '30 Days' },
  { label: 'Custom', value: 'Custom' },
];

export const VendorFormModal: React.FC<VendorFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const { colors } = useTheme();

  const [firmName, setFirmName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<any>('15 Days');
  const [openingBalance, setOpeningBalance] = useState('0');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFirmName(initialData.firmName || '');
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setGstin(initialData.gstin || '');
      setPaymentTerms(initialData.paymentTerms || '15 Days');
      setOpeningBalance(String(initialData.openingBalance || 0));
    } else {
      setFirmName('');
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setGstin('');
      setPaymentTerms('15 Days');
      setOpeningBalance('0');
    }
    setErrors({});
  }, [initialData, visible]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firmName.trim()) errs.firmName = 'Firm Name is required';
    if (!name.trim()) errs.name = 'Contact Person / Vendor Name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!address.trim()) errs.address = 'Address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await onSubmit({
        firmName: firmName.trim(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        gstin: gstin.trim().toUpperCase(),
        paymentTerms,
        openingBalance: Number(openingBalance) || 0,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save vendor');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Edit Vendor' : 'Add New Vendor'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Input
          label="Firm / Business Name *"
          placeholder="e.g. Raj Traders Pvt Ltd"
          value={firmName}
          onChangeText={setFirmName}
          error={errors.firmName}
        />

        <Input
          label="Contact Person Name *"
          placeholder="e.g. Raj Kumar"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Phone Number *"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>
          <View style={styles.col}>
            <Input
              label="GST Number"
              placeholder="09AABCR1234M1Z5"
              value={gstin}
              onChangeText={setGstin}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <Input
          label="Email Address"
          placeholder="sales@rajtraders.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Address *"
          placeholder="e.g. Sigra Main Road, Varanasi"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
          error={errors.address}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Select
              label="Payment Terms"
              options={PAYMENT_TERMS_OPTIONS}
              value={paymentTerms}
              onSelect={setPaymentTerms}
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Opening Balance (₹)"
              placeholder="0"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.actions, { borderTopColor: colors.divider }]}>
          <Button variant="outline" onPress={onClose} disabled={loading} style={styles.actionBtn}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} loading={loading} style={styles.actionBtn}>
            {initialData ? 'Update Vendor' : 'Save Vendor'}
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

export default VendorFormModal;
