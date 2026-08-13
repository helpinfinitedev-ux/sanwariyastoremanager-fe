import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  AuthRoot: NavigatorScreenParams<AuthStackParamList>;
  MainRoot: NavigatorScreenParams<MainDrawerParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  PurchaseStack: NavigatorScreenParams<PurchaseStackParamList>;
  InventoryStack: NavigatorScreenParams<InventoryStackParamList>;
  KitchenIssueStack: NavigatorScreenParams<KitchenIssueStackParamList>;
  WasteStack: NavigatorScreenParams<WasteStackParamList>;
  StockMovementStack: NavigatorScreenParams<StockMovementStackParamList>;
  ReportsStack: NavigatorScreenParams<ReportsStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

export type PurchaseStackParamList = {
  PurchaseList: { refresh?: boolean } | undefined;
  PurchaseDetails: { id: string };
  CreatePurchase: undefined;
  EditPurchase: { id: string };
};

export type InventoryStackParamList = {
  InventoryList: undefined;
  ProductDetails: { id: string };
};

export type KitchenIssueStackParamList = {
  KitchenIssueList: undefined;
  CreateKitchenIssue: undefined;
  KitchenIssueDetails: { id: string };
};

export type WasteStackParamList = {
  WasteList: undefined;
  CreateWaste: undefined;
  WasteDetails: { id: string };
};

export type StockMovementStackParamList = {
  StockMovementList: undefined;
};

export type ReportsStackParamList = {
  ReportsHome: undefined;
  PurchaseReport: undefined;
  InventoryReport: undefined;
  KitchenIssueReport: undefined;
  WasteReport: undefined;
  StockMovementReport: undefined;
};

export type ProfileStackParamList = {
  ProfileDetails: undefined;
};
