import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../../store/themeStore';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { useLogout } from '../../../features/auth/hooks/useAuth';
import ConfirmDialog from '../feedback/ConfirmDialog';
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
  const logout = useLogout();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
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
        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn} accessibilityLabel="Toggle theme">
          <Ionicons
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* User initials bubble shortcut */}
        {user && (
          <View style={styles.userSection}>
            <View style={[styles.userBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.userBadgeText, { color: colors.primary }]}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            {!isMobile && (
              <Text style={[styles.userNameText, { color: colors.text }]} numberOfLines={1}>
                {user.name}
              </Text>
            )}
          </View>
        )}

        {/* Quick Sign Out Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setLogoutConfirmVisible(true)}
          style={[styles.signOutBtn, { backgroundColor: colors.danger + '12', borderColor: colors.danger + '30' }]}
          accessibilityLabel="Sign Out"
        >
          <Ionicons name="log-out-outline" size={16} color={colors.danger} />
          {!isMobile && (
            <Text style={[styles.signOutBtnText, { color: colors.danger }]}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        visible={logoutConfirmVisible}
        onClose={() => setLogoutConfirmVisible(false)}
        onConfirm={() => {
          setLogoutConfirmVisible(false);
          logout();
        }}
        title="Sign Out"
        message="Are you sure you want to end your active session and sign out of Sanwariya Store Manager?"
        confirmText="Sign Out"
        type="danger"
      />
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  userNameText: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 120,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  signOutBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TopBar;
