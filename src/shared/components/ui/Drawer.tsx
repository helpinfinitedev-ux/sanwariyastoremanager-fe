import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Desktop threshold
  const isDesktop = width >= 768;
  const drawerWidth = isDesktop ? 500 : width * 0.9;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // Custom container animation is handled on overlay or simple fade
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Dimmed background dismiss trigger */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.drawerContent,
            {
              width: drawerWidth,
              backgroundColor: colors.surface,
              borderLeftColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={styles.scrollBody}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  drawerContent: {
    height: '100%',
    zIndex: 2,
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    height: 56,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollBody: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
});

export default Drawer;
