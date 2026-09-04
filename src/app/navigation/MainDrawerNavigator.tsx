import React, { useState } from 'react';
import { useWindowDimensions } from '@/web/primitives';
import { NavigationProvider, useCurrentRoute } from '@/web/navigation';
import Sidebar from '../../shared/components/layout/Sidebar';
import { ROUTES } from '../../shared/constants/routes';

import DashboardScreen from '../../features/dashboard/screens/DashboardScreen';
import PurchaseListScreen from '../../features/purchase/screens/PurchaseListScreen';
import PurchaseDetailsScreen from '../../features/purchase/screens/PurchaseDetailsScreen';
import CreatePurchaseScreen from '../../features/purchase/screens/CreatePurchaseScreen';
import EditPurchaseScreen from '../../features/purchase/screens/EditPurchaseScreen';
import VendorListScreen from '../../features/vendor/screens/VendorListScreen';
import VendorDetailsScreen from '../../features/vendor/screens/VendorDetailsScreen';
import ExpensesScreen from '../../features/expenses/screens/ExpensesScreen';
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
import ExpenseReportScreen from '../../features/reports/screens/ExpenseReportScreen';
import StockMovementReportScreen from '../../features/reports/screens/StockMovementReportScreen';
import VendorPayablesReportScreen from '../../features/reports/screens/VendorPayablesReportScreen';
import ProfileScreen from '../../features/auth/screens/ProfileScreen';

const screens: Record<string, React.ComponentType<any>> = {
  [ROUTES.MAIN.DASHBOARD]: DashboardScreen,
  [ROUTES.PURCHASE_SCREENS.LIST]: PurchaseListScreen,
  [ROUTES.PURCHASE_SCREENS.DETAILS]: PurchaseDetailsScreen,
  [ROUTES.PURCHASE_SCREENS.CREATE]: CreatePurchaseScreen,
  [ROUTES.PURCHASE_SCREENS.EDIT]: EditPurchaseScreen,
  [ROUTES.VENDORS_SCREENS.LIST]: VendorListScreen,
  [ROUTES.VENDORS_SCREENS.DETAILS]: VendorDetailsScreen,
  [ROUTES.EXPENSES_SCREENS.MAIN]: ExpensesScreen,
  [ROUTES.INVENTORY_SCREENS.LIST]: InventoryListScreen,
  [ROUTES.INVENTORY_SCREENS.DETAILS]: ProductDetailsScreen,
  [ROUTES.KITCHEN_ISSUE_SCREENS.LIST]: IssueHistoryScreen,
  [ROUTES.KITCHEN_ISSUE_SCREENS.CREATE]: IssueStockScreen,
  [ROUTES.KITCHEN_ISSUE_SCREENS.DETAILS]: IssueDetailsScreen,
  [ROUTES.WASTE_SCREENS.LIST]: WasteHistoryScreen,
  [ROUTES.WASTE_SCREENS.CREATE]: WasteEntryScreen,
  [ROUTES.WASTE_SCREENS.DETAILS]: WasteDetailsScreen,
  [ROUTES.STOCK_MOVEMENT_SCREENS.LIST]: StockMovementScreen,
  [ROUTES.REPORTS_SCREENS.HOME]: ReportsHomeScreen,
  [ROUTES.REPORTS_SCREENS.PURCHASE]: PurchaseReportScreen,
  [ROUTES.REPORTS_SCREENS.INVENTORY]: InventoryReportScreen,
  [ROUTES.REPORTS_SCREENS.KITCHEN_ISSUE]: KitchenIssueReportScreen,
  [ROUTES.REPORTS_SCREENS.WASTE]: WasteReportScreen,
  [ROUTES.REPORTS_SCREENS.EXPENSE]: ExpenseReportScreen,
  [ROUTES.REPORTS_SCREENS.STOCK_MOVEMENT]: StockMovementReportScreen,
  [ROUTES.REPORTS_SCREENS.VENDORS]: VendorPayablesReportScreen,
  [ROUTES.PROFILE_SCREENS.DETAILS]: ProfileScreen,
};

const AppShell = ({ drawerOpen, closeDrawer }: { drawerOpen: boolean; closeDrawer: () => void }) => {
  const { width } = useWindowDimensions();
  const { route } = useCurrentRoute();
  const desktop = width >= 768;
  const Screen = screens[route] || DashboardScreen;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {desktop && <aside style={{ width: 260, flexShrink: 0, height: '100%' }}><Sidebar /></aside>}
      {!desktop && drawerOpen && (
        <div role="presentation" onClick={closeDrawer} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.48)' }}>
          <aside onClick={(event) => event.stopPropagation()} style={{ width: 'min(86vw, 300px)', height: '100%', boxShadow: '12px 0 36px rgba(15,23,42,.24)' }}>
            <Sidebar />
          </aside>
        </div>
      )}
      <main style={{ minWidth: 0, flex: 1, height: '100%', overflow: 'hidden' }}>
        <Screen />
      </main>
    </div>
  );
};

export const MainDrawerNavigator: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <NavigationProvider drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
      <AppShell drawerOpen={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
    </NavigationProvider>
  );
};

export default MainDrawerNavigator;
