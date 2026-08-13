import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../../store/themeStore';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';

interface TopBarProps {
  title: string;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onMenuPress,
  showMenuButton = true,
}) => {
  const { colors, theme } = useTheme();
  const { toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        {isMobile && showMenuButton && onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {/* Quick Theme Toggle */}
        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
          <Ionicons
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* User initials bubble shortcut */}
        {user && (
          <View style={[styles.userBadge, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.userBadgeText, { color: colors.primary }]}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default TopBar;
