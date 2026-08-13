import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { spacing, typography } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';

interface SidebarItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const Sidebar: React.FC<DrawerContentComponentProps> = ({ navigation, state }) => {
  const { colors, theme } = useTheme();
  const { user } = useAuthStore();

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', route: ROUTES.MAIN.DASHBOARD, icon: 'grid-outline' },
    { name: 'Purchase Management', route: ROUTES.MAIN.PURCHASE, icon: 'receipt-outline' },
    { name: 'Inventory Management', route: ROUTES.MAIN.INVENTORY, icon: 'cube-outline' },
    { name: 'Kitchen Issue', route: ROUTES.MAIN.KITCHEN_ISSUE, icon: 'restaurant-outline' },
    { name: 'Waste Management', route: ROUTES.MAIN.WASTE, icon: 'trash-outline' },
    { name: 'Stock Movement', route: ROUTES.MAIN.STOCK_MOVEMENT, icon: 'swap-horizontal-outline' },
    { name: 'Reports & Analytics', route: ROUTES.MAIN.REPORTS, icon: 'bar-chart-outline' },
    { name: 'Profile Settings', route: ROUTES.MAIN.PROFILE, icon: 'person-outline' },
  ];

  // Map state.index to active items
  const activeRouteName = state.routeNames[state.index];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      {/* Brand Header */}
      <View style={[styles.brandHeader, { borderBottomColor: colors.divider }]}>
        <Ionicons name="storefront" size={24} color={colors.primary} />
        <View>
          <Text style={[styles.brandText, { color: colors.text }]}>Sanwariya ERP</Text>
          <Text style={[styles.brandSubtext, { color: colors.textSecondary }]}>Store Manager</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView contentContainerStyle={styles.menuList} style={styles.scroll}>
        {menuItems.map((item) => {
          // Check if item's route is active
          // Note: route might match MainDrawerParamList keys (e.g. 'Dashboard' or 'PurchaseStack')
          const isSelected = activeRouteName === item.route;

          return (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.route)}
              style={[
                styles.menuItem,
                {
                  backgroundColor: isSelected ? colors.surfaceHover : 'transparent',
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer Info */}
      {user && (
        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          <View style={styles.userInfo}>
            <View style={[styles.userBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.userBadgeText, { color: colors.primary }]}>
                {user.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.userText}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={[styles.userRole, { color: colors.textSecondary }]} numberOfLines={1}>
                {user.role}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRightWidth: 1,
    height: '100%',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
    height: 56,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
  },
  brandSubtext: {
    fontSize: 10.5,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  menuList: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    gap: spacing.md,
    height: 40,
  },
  menuItemText: {
    fontSize: 13,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.md,
    height: 56,
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 10,
  },
});

export default Sidebar;
