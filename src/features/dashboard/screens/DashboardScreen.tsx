import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useDashboardKpis, useRecentActivities } from '../hooks/useDashboard';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing, typography } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import KpiCard from '../../../shared/components/ui/KpiCard';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDate, truncateText } from '../../../shared/utils/formatters';
import { ROUTES } from '../../../shared/constants/routes';
import { MainDrawerParamList } from '../../../app/navigation/types';

type NavigationProp = DrawerNavigationProp<MainDrawerParamList>;

export const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useDashboardKpis();
  const { data: activities, isLoading: actsLoading, refetch: refetchActs } = useRecentActivities();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const handleRefresh = () => {
    refetchKpis();
    refetchActs();
  };

  const getGridColumns = () => {
    if (isDesktop) return 4;
    if (isTablet) return 2;
    return 1;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return { name: 'receipt-outline' as const, color: colors.success };
      case 'issue':
        return { name: 'restaurant-outline' as const, color: colors.info };
      case 'waste':
        return { name: 'trash-outline' as const, color: colors.danger };
      default:
        return { name: 'notifications-outline' as const, color: colors.textSecondary };
    }
  };

  const cols = getGridColumns();
  const itemWidth = `${100 / cols}%` as any;

  if (kpisLoading || actsLoading) {
    return (
      <ScreenContainer title="Dashboard">
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
            Loading analytics dashboard...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Dashboard" onMenuPress={() => navigation.openDrawer()}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader 
          title="Store Operations Control Center" 
          subtitle="Real-time key performance indicators, stock alerts, and quick commands"
        >
          <Button 
            title="Refresh Feed" 
            onPress={handleRefresh} 
            variant="outline" 
            size="sm" 
          />
        </PageHeader>

        {/* KPIs Grid */}
        <View style={styles.kpiContainer}>
          <View style={[styles.gridRow, { flexWrap: 'wrap' }]}>
            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Total Items"
                value={kpis?.totalItems || 0}
                iconName="cube-outline"
                iconColor={colors.primary}
                onPress={() => navigation.navigate(ROUTES.MAIN.INVENTORY)}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Inventory Value"
                value={formatCurrency(kpis?.inventoryValue || 0)}
                iconName="bar-chart-outline"
                iconColor={colors.info}
                onPress={() => navigation.navigate(ROUTES.MAIN.INVENTORY)}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Low Stock Warning"
                value={kpis?.lowStockCount || 0}
                iconName="warning-outline"
                iconColor={colors.warning}
                onPress={() => {
                  // Direct navigation to filtered inventory
                  navigation.navigate(ROUTES.MAIN.INVENTORY);
                }}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Out of Stock Alert"
                value={kpis?.outOfStockCount || 0}
                iconName="alert-circle-outline"
                iconColor={colors.danger}
                onPress={() => {
                  navigation.navigate(ROUTES.MAIN.INVENTORY);
                }}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Today's Purchase"
                value={formatCurrency(kpis?.todayPurchaseValue || 0)}
                iconName="cart-outline"
                iconColor={colors.success}
                onPress={() => navigation.navigate(ROUTES.MAIN.PURCHASE)}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Today's Issues"
                value={kpis?.todayIssueCount || 0}
                iconName="restaurant-outline"
                iconColor={colors.info}
                onPress={() => navigation.navigate(ROUTES.MAIN.KITCHEN_ISSUE)}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Today's Waste"
                value={formatCurrency(kpis?.todayWasteValue || 0)}
                iconName="trash-outline"
                iconColor={colors.danger}
                onPress={() => navigation.navigate(ROUTES.MAIN.WASTE)}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Total Expenses"
                value={formatCurrency(kpis?.totalExpenses || 0)}
                iconName="wallet-outline"
                iconColor={colors.warning}
                onPress={() => navigation.navigate(ROUTES.MAIN.EXPENSES)}
              />
            </View>

            <View style={[styles.gridItem, { width: itemWidth }]}>
              <KpiCard
                title="Vendor Outstanding"
                value={formatCurrency(kpis?.vendorOutstanding || 0)}
                iconName="cash-outline"
                iconColor={colors.danger}
                onPress={() => navigation.navigate(ROUTES.MAIN.VENDORS)}
              />
            </View>
          </View>
        </View>

        {/* Dashboard Split Sections */}
        <View style={[styles.splitGrid, isDesktop && styles.rowSplit]}>
          
          {/* Recent Operations Log */}
          <Card style={[styles.splitCard, { flex: 1.5 }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Recent Store Operations Feed
              </Text>
            </View>
            <View style={styles.activityList}>
              {activities && activities.length > 0 ? (
                activities.map((act) => {
                  const iconDetails = getActivityIcon(act.type);
                  return (
                    <View key={act.id} style={[styles.activityItem, { borderBottomColor: colors.divider }]}>
                      <View style={[styles.activityIconBg, { backgroundColor: iconDetails.color + '10' }]}>
                        <Ionicons name={iconDetails.name} size={16} color={iconDetails.color} />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={[styles.activityDesc, { color: colors.text }]}>
                          {act.description}
                        </Text>
                        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                          {formatDate(act.timestamp)} by {act.actor}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyList}>
                  <Ionicons name="document-text-outline" size={28} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No recent store activities registered.
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Quick Actions Panel */}
          <Card style={[styles.splitCard, { flex: 1 }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Quick Actions Panel
              </Text>
            </View>
            <View style={styles.actionsPanel}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.actionCell, { backgroundColor: colors.surfaceHover }]}
                onPress={() => {
                  navigation.navigate(ROUTES.MAIN.PURCHASE, {
                    screen: ROUTES.PURCHASE_SCREENS.CREATE,
                  } as any);
                }}
              >
                <Ionicons name="cart" size={24} color={colors.success} />
                <Text style={[styles.actionCellTitle, { color: colors.text }]}>Restock Purchase</Text>
                <Text style={[styles.actionCellDesc, { color: colors.textSecondary }]}>Create fresh vendor order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.actionCell, { backgroundColor: colors.surfaceHover }]}
                onPress={() => {
                  navigation.navigate(ROUTES.MAIN.KITCHEN_ISSUE, {
                    screen: ROUTES.KITCHEN_ISSUE_SCREENS.CREATE,
                  } as any);
                }}
              >
                <Ionicons name="restaurant" size={24} color={colors.info} />
                <Text style={[styles.actionCellTitle, { color: colors.text }]}>Issue to Kitchen</Text>
                <Text style={[styles.actionCellDesc, { color: colors.textSecondary }]}>Record raw stock delivery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.actionCell, { backgroundColor: colors.surfaceHover }]}
                onPress={() => {
                  navigation.navigate(ROUTES.MAIN.WASTE, {
                    screen: ROUTES.WASTE_SCREENS.CREATE,
                  } as any);
                }}
              >
                <Ionicons name="trash" size={24} color={colors.danger} />
                <Text style={[styles.actionCellTitle, { color: colors.text }]}>Log Store Waste</Text>
                <Text style={[styles.actionCellDesc, { color: colors.textSecondary }]}>Record spoilage or decay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.actionCell, { backgroundColor: colors.surfaceHover }]}
                onPress={() => {
                  navigation.navigate(ROUTES.MAIN.REPORTS as any);
                }}
              >
                <Ionicons name="bar-chart" size={24} color={colors.primary} />
                <Text style={[styles.actionCellTitle, { color: colors.text }]}>Analytics & Reports</Text>
                <Text style={[styles.actionCellDesc, { color: colors.textSecondary }]}>View trends & export stats</Text>
              </TouchableOpacity>
            </View>
          </Card>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loaderText: {
    fontSize: 14,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  scrollBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  kpiContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  gridItem: {
    padding: spacing.xs,
    boxSizing: 'border-box' as any,
  },
  splitGrid: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
  },
  rowSplit: {
    flexDirection: 'row',
  },
  splitCard: {
    padding: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityList: {
    gap: spacing.xs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  activityIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
  },
  actionsPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCell: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    textAlign: 'center',
    gap: spacing.xs,
  },
  actionCellTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  actionCellDesc: {
    fontSize: 10.5,
    textAlign: 'center',
  },
});

export default DashboardScreen;
