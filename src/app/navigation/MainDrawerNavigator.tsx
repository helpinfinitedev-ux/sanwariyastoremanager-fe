import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWindowDimensions } from 'react-native';
import Sidebar from '../../shared/components/layout/Sidebar';
import { MainDrawerParamList, PurchaseStackParamList, InventoryStackParamList, KitchenIssueStackParamList, WasteStackParamList, StockMovementStackParamList, ReportsStackParamList, ProfileStackParamList } from './types';
import { ROUTES } from '../../shared/constants/routes';

// Screens imports
import DashboardScreen from '../../features/dashboard/screens/DashboardScreen';
import PurchaseListScreen from '../../features/purchase/screens/PurchaseListScreen';
import PurchaseDetailsScreen from '../../features/purchase/screens/PurchaseDetailsScreen';
import CreatePurchaseScreen from '../../features/purchase/screens/CreatePurchaseScreen';
import EditPurchaseScreen from '../../features/purchase/screens/EditPurchaseScreen';

import InventoryListScreen from '../../features/inventory/screens/InventoryListScreen';
import ProductDetailsScreen from '../../features/inventory/screens/ProductDetailsScreen';

import IssueHistoryScreen from '../../features/kitchen-issue/screens/IssueHistoryScreen';
import IssueStockScreen from '../../features/kitchen-issue/screens/IssueStockScreen';
import IssueDetailsScreen from '../../features/kitchen-issue/screens/IssueDetailsScreen';

import WasteHistoryScreen from '../../features/waste/screens/WasteHistoryScreen';
import WasteEntryScreen from '../../features/waste/screens/WasteEntryScreen';
import WasteDetailsScreen from '../../features/waste/screens/WasteDetailsScreen';

import StockMovementScreen from '../../features/stock-movement/screens/StockMovementScreen';

import ReportsHomeScreen from '../../features/reports/screens/ReportsHomeScreen';
import PurchaseReportScreen from '../../features/reports/screens/PurchaseReportScreen';
import InventoryReportScreen from '../../features/reports/screens/InventoryReportScreen';
import KitchenIssueReportScreen from '../../features/reports/screens/KitchenIssueReportScreen';
import WasteReportScreen from '../../features/reports/screens/WasteReportScreen';

import ProfileScreen from '../../features/auth/screens/ProfileScreen';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Nested Stacks
const PurchaseStack = createNativeStackNavigator<PurchaseStackParamList>();
const PurchaseStackNavigator = () => (
  <PurchaseStack.Navigator screenOptions={{ headerShown: false }}>
    <PurchaseStack.Screen name={ROUTES.PURCHASE_SCREENS.LIST} component={PurchaseListScreen} />
    <PurchaseStack.Screen name={ROUTES.PURCHASE_SCREENS.DETAILS} component={PurchaseDetailsScreen} />
    <PurchaseStack.Screen name={ROUTES.PURCHASE_SCREENS.CREATE} component={CreatePurchaseScreen} />
    <PurchaseStack.Screen name={ROUTES.PURCHASE_SCREENS.EDIT} component={EditPurchaseScreen} />
  </PurchaseStack.Navigator>
);

const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const InventoryStackNavigator = () => (
  <InventoryStack.Navigator screenOptions={{ headerShown: false }}>
    <InventoryStack.Screen name={ROUTES.INVENTORY_SCREENS.LIST} component={InventoryListScreen} />
    <InventoryStack.Screen name={ROUTES.INVENTORY_SCREENS.DETAILS} component={ProductDetailsScreen} />
  </InventoryStack.Navigator>
);

const KitchenIssueStack = createNativeStackNavigator<KitchenIssueStackParamList>();
const KitchenIssueStackNavigator = () => (
  <KitchenIssueStack.Navigator screenOptions={{ headerShown: false }}>
    <KitchenIssueStack.Screen name={ROUTES.KITCHEN_ISSUE_SCREENS.LIST} component={IssueHistoryScreen} />
    <KitchenIssueStack.Screen name={ROUTES.KITCHEN_ISSUE_SCREENS.CREATE} component={IssueStockScreen} />
    <KitchenIssueStack.Screen name={ROUTES.KITCHEN_ISSUE_SCREENS.DETAILS} component={IssueDetailsScreen} />
  </KitchenIssueStack.Navigator>
);

const WasteStack = createNativeStackNavigator<WasteStackParamList>();
const WasteStackNavigator = () => (
  <WasteStack.Navigator screenOptions={{ headerShown: false }}>
    <WasteStack.Screen name={ROUTES.WASTE_SCREENS.LIST} component={WasteHistoryScreen} />
    <WasteStack.Screen name={ROUTES.WASTE_SCREENS.CREATE} component={WasteEntryScreen} />
    <WasteStack.Screen name={ROUTES.WASTE_SCREENS.DETAILS} component={WasteDetailsScreen} />
  </WasteStack.Navigator>
);

const StockMovementStack = createNativeStackNavigator<StockMovementStackParamList>();
const StockMovementStackNavigator = () => (
  <StockMovementStack.Navigator screenOptions={{ headerShown: false }}>
    <StockMovementStack.Screen name={ROUTES.STOCK_MOVEMENT_SCREENS.LIST} component={StockMovementScreen} />
  </StockMovementStack.Navigator>
);

const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const ReportsStackNavigator = () => (
  <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
    <ReportsStack.Screen name={ROUTES.REPORTS_SCREENS.HOME} component={ReportsHomeScreen} />
    <ReportsStack.Screen name={ROUTES.REPORTS_SCREENS.PURCHASE} component={PurchaseReportScreen} />
    <ReportsStack.Screen name={ROUTES.REPORTS_SCREENS.INVENTORY} component={InventoryReportScreen} />
    <ReportsStack.Screen name={ROUTES.REPORTS_SCREENS.KITCHEN_ISSUE} component={KitchenIssueReportScreen} />
    <ReportsStack.Screen name={ROUTES.REPORTS_SCREENS.WASTE} component={WasteReportScreen} />
  </ReportsStack.Navigator>
);

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name={ROUTES.PROFILE_SCREENS.DETAILS} component={ProfileScreen} />
  </ProfileStack.Navigator>
);

// Drawer Navigator Root
export const MainDrawerNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: isDesktop ? 'permanent' : 'front',
        drawerStyle: {
          width: 260,
        },
      }}
    >
      <Drawer.Screen name={ROUTES.MAIN.DASHBOARD as any} component={DashboardScreen} />
      <Drawer.Screen name={ROUTES.MAIN.PURCHASE as any} component={PurchaseStackNavigator} />
      <Drawer.Screen name={ROUTES.MAIN.INVENTORY as any} component={InventoryStackNavigator} />
      <Drawer.Screen name={ROUTES.MAIN.KITCHEN_ISSUE as any} component={KitchenIssueStackNavigator} />
      <Drawer.Screen name={ROUTES.MAIN.WASTE as any} component={WasteStackNavigator} />
      <Drawer.Screen name={ROUTES.MAIN.STOCK_MOVEMENT as any} component={StockMovementStackNavigator} />
      <Drawer.Screen name={ROUTES.MAIN.REPORTS as any} component={ReportsStackNavigator} />
      <Drawer.Screen name={ROUTES.MAIN.PROFILE as any} component={ProfileStackNavigator} />
    </Drawer.Navigator>
  );
};

export default MainDrawerNavigator;
