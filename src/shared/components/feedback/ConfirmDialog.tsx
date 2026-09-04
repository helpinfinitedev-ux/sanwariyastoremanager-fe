import React from 'react';
import { View, Text, StyleSheet } from '@/web/primitives';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { spacing } from '../../theme/themes';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary',
  loading = false,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      onClose={loading ? () => {} : onClose}
      title={title}
      containerStyle={styles.modalWidth}
    >
      <View style={styles.body}>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
        
        <View style={styles.actions}>
          <Button
            title={cancelText}
            onPress={onClose}
            variant="outline"
            disabled={loading}
            style={styles.btn}
          />
          <Button
            title={confirmText}
            onPress={onConfirm}
            variant={type === 'danger' ? 'danger' : 'primary'}
            loading={loading}
            style={styles.btn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWidth: {
    maxWidth: 400,
  },
  body: {
    gap: spacing.lg,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    minWidth: 90,
  },
});

export default ConfirmDialog;
