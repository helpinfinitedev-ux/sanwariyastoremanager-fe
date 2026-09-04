import React from 'react';
import { Modal as RNModal, View, Text, StyleSheet, TouchableOpacity, ViewStyle } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@/web/icons';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  containerStyle,
}) => {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.content,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            containerStyle,
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.body}>{children}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 2,
  },
  body: {
    padding: spacing.lg,
  },
});

export default Modal;
