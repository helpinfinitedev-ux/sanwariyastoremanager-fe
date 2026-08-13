import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useThemeStore } from '../../../store/themeStore';
import { spacing, typography } from '../../../shared/theme/themes';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/layout/PageHeader';
import ConfirmDialog from '../../../shared/components/feedback/ConfirmDialog';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { colors, theme } = useTheme();
  const { toggleTheme } = useThemeStore();
  const logout = useLogout();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader 
        title="My Profile" 
        subtitle="Manage user session, store mappings, and client preferences"
      />

      <View style={styles.content}>
        <View style={styles.grid}>
          {/* User Information Card */}
          <Card style={styles.card}>
            <View style={styles.avatarSection}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="person" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.userRole, { color: colors.textSecondary }]}>{user.role}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                <View style={styles.detailText}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Mobile Number</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{user.mobileNumber}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                <View style={styles.detailText}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Assigned Store</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{user.storeName}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Preferences Card */}
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
            <View style={[styles.prefRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.prefInfo}>
                <Text style={[styles.prefLabel, { color: colors.text }]}>Visual Theme</Text>
                <Text style={[styles.prefDesc, { color: colors.textSecondary }]}>
                  Toggle between Light and Dark application interfaces
                </Text>
              </View>
              <Button
                title={theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                onPress={toggleTheme}
                variant="outline"
                size="sm"
                style={styles.themeBtn}
              />
            </View>

            <View style={styles.logoutSection}>
              <Text style={[styles.prefDesc, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                Sign out of your active session on this device. Doing so will clear all local storage credentials.
              </Text>
              <Button
                title="Log Out"
                onPress={() => setLogoutConfirmVisible(true)}
                variant="danger"
                style={styles.logoutBtn}
              />
            </View>
          </Card>
        </View>
      </View>

      <ConfirmDialog
        visible={logoutConfirmVisible}
        onClose={() => setLogoutConfirmVisible(false)}
        onConfirm={() => {
          setLogoutConfirmVisible(false);
          logout();
        }}
        title="Sign Out Session"
        message="Are you sure you want to log out of the Restaurant Store ERP? This will terminate your session."
        confirmText="Log Out"
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    flex: 1,
    minWidth: 320,
    padding: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  detailsSection: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    marginBottom: spacing.lg,
  },
  prefInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  prefDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  themeBtn: {
    minWidth: 110,
  },
  logoutSection: {
    marginTop: spacing.sm,
  },
  logoutBtn: {
    width: '100%',
  },
});

export default ProfileScreen;
