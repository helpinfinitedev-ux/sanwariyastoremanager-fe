import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Button from '../../../shared/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAdjustStock } from '../hooks/useInventory';

interface StockAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    currentStock: number;
  };
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  visible,
  onClose,
  product,
}) => {
  const { colors } = useTheme();
  const adjustMutation = useAdjustStock();

  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Physical count variance');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const reasonOptions = [
    { label: 'Physical count variance', value: 'Physical count variance' },
    { label: 'Damaged packaging / spillage', value: 'Damaged packaging / spillage' },
    { label: 'Return to vendor / supplier', value: 'Return to vendor / supplier' },
    { label: 'Transfer adjustment', value: 'Transfer adjustment' },
    { label: 'Opening balance correction', value: 'Opening balance correction' },
    { label: 'Other', value: 'Other' },
  ];

  const handleSubmit = () => {
    setErrorMsg('');
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg('Quantity must be a positive number greater than 0.');
      return;
    }

    if (adjustmentType === 'OUT' && parsedQty > product.currentStock) {
      setErrorMsg(`Cannot adjust OUT more than current stock (${product.currentStock} ${product.unit}).`);
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Reason is required.');
      return;
    }

    adjustMutation.mutate(
      {
        id: product.id,
        payload: {
          adjustmentType,
          quantity: parsedQty,
          reason: reason.trim(),
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setQuantity('');
          setNotes('');
          onClose();
        },
        onError: (err: any) => {
          setErrorMsg(err.message || 'Failed to adjust stock.');
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Stock Adjustment</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {product.name} ({product.sku}) — Available: {product.currentStock} {product.unit}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Adjustment Type Toggle */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Adjustment Type</Text>
            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  adjustmentType === 'IN' && { backgroundColor: colors.success + '20', borderColor: colors.success },
                ]}
                onPress={() => setAdjustmentType('IN')}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={18}
                  color={adjustmentType === 'IN' ? colors.success : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: adjustmentType === 'IN' ? colors.success : colors.textSecondary },
                  ]}
                >
                  Adjustment IN (Restock / Add)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  adjustmentType === 'OUT' && { backgroundColor: colors.danger + '20', borderColor: colors.danger },
                ]}
                onPress={() => setAdjustmentType('OUT')}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={18}
                  color={adjustmentType === 'OUT' ? colors.danger : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: adjustmentType === 'OUT' ? colors.danger : colors.textSecondary },
                  ]}
                >
                  Adjustment OUT (Deduct / Loss)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quantity Input */}
            <Input
              label={`Adjustment Quantity (${product.unit})`}
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text);
                setErrorMsg('');
              }}
              placeholder="e.g. 5"
              keyboardType="numeric"
            />

            {/* Reason Select */}
            <Select
              label="Reason for Adjustment"
              value={reason}
              options={reasonOptions}
              onSelect={setReason}
            />

            {/* Notes */}
            <Input
              label="Additional Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Provide audit reference or remarks..."
            />

            {/* Error Message */}
            {!!errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + '15' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button title="Cancel" variant="outline" onPress={onClose} disabled={adjustMutation.isPending} />
            <Button
              title={adjustMutation.isPending ? 'Adjusting...' : 'Confirm Adjustment'}
              variant="primary"
              onPress={handleSubmit}
              disabled={adjustMutation.isPending}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: -spacing.xs,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});

export default StockAdjustmentModal;
