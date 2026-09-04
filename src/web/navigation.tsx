import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ROUTES } from '../shared/constants/routes';

export type RouteProp<ParamList, RouteName extends keyof ParamList> = {
  key: string;
  name: RouteName;
  params: ParamList[RouteName];
};

export type NavigatorScreenParams<T> = { screen?: keyof T; params?: T[keyof T] } | undefined;

export interface WebNavigation {
  navigate: (name: string, params?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  getParent: () => WebNavigation;
}

export type NativeStackNavigationProp<_ParamList, _RouteName = any> = WebNavigation;
export type DrawerNavigationProp<_ParamList, _RouteName = any> = WebNavigation;

type NavigationState = { route: string; params?: any };
type NavigationContextValue = WebNavigation & NavigationState;

const NavigationContext = createContext<NavigationContextValue | null>(null);

const routeGroups: Record<string, { root: string; screens: string[] }> = {
  [ROUTES.MAIN.DASHBOARD]: { root: ROUTES.MAIN.DASHBOARD, screens: [ROUTES.MAIN.DASHBOARD] },
  [ROUTES.MAIN.PURCHASE]: { root: ROUTES.PURCHASE_SCREENS.LIST, screens: Object.values(ROUTES.PURCHASE_SCREENS) },
  [ROUTES.MAIN.VENDORS]: { root: ROUTES.VENDORS_SCREENS.LIST, screens: Object.values(ROUTES.VENDORS_SCREENS) },
  [ROUTES.MAIN.EXPENSES]: { root: ROUTES.EXPENSES_SCREENS.MAIN, screens: Object.values(ROUTES.EXPENSES_SCREENS) },
  [ROUTES.MAIN.INVENTORY]: { root: ROUTES.INVENTORY_SCREENS.LIST, screens: Object.values(ROUTES.INVENTORY_SCREENS) },
  [ROUTES.MAIN.KITCHEN_ISSUE]: { root: ROUTES.KITCHEN_ISSUE_SCREENS.LIST, screens: Object.values(ROUTES.KITCHEN_ISSUE_SCREENS) },
  [ROUTES.MAIN.WASTE]: { root: ROUTES.WASTE_SCREENS.LIST, screens: Object.values(ROUTES.WASTE_SCREENS) },
  [ROUTES.MAIN.STOCK_MOVEMENT]: { root: ROUTES.STOCK_MOVEMENT_SCREENS.LIST, screens: Object.values(ROUTES.STOCK_MOVEMENT_SCREENS) },
  [ROUTES.MAIN.REPORTS]: { root: ROUTES.REPORTS_SCREENS.HOME, screens: Object.values(ROUTES.REPORTS_SCREENS) },
  [ROUTES.MAIN.PROFILE]: { root: ROUTES.PROFILE_SCREENS.DETAILS, screens: Object.values(ROUTES.PROFILE_SCREENS) },
};

export const groupForRoute = (route: string) => Object.entries(routeGroups).find(([, config]) => config.screens.includes(route))?.[0] || ROUTES.MAIN.DASHBOARD;

const readHash = (): NavigationState => {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { route: ROUTES.MAIN.DASHBOARD };
  const [route, query = ''] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));
  const known = Object.values(routeGroups).some((group) => group.screens.includes(route));
  return known ? { route, params } : { route: ROUTES.MAIN.DASHBOARD };
};

const writeHash = ({ route, params }: NavigationState, replace = false) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  const next = `#/${route}${query}`;
  if (replace) window.history.replaceState(null, '', next);
  else window.location.hash = next;
};

export const NavigationProvider = ({ children, setDrawerOpen }: {
  children: React.ReactNode;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}) => {
  const [state, setState] = useState<NavigationState>(() => readHash());
  const [history, setHistory] = useState<NavigationState[]>([]);

  useEffect(() => {
    if (!window.location.hash) writeHash(state, true);
    const onHashChange = () => setState(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const value = useMemo<NavigationContextValue>(() => {
    const navigation: WebNavigation = {
      navigate(name, params) {
        const group = routeGroups[name];
        const next = group
          ? { route: String(params?.screen || group.root), params: params?.screen ? params.params : params }
          : { route: name, params };
        setHistory((current) => [...current, state]);
        setState(next);
        writeHash(next);
        setDrawerOpen(false);
      },
      goBack() {
        setHistory((current) => {
          const previous = current[current.length - 1];
          if (previous) {
            setState(previous);
            writeHash(previous);
            return current.slice(0, -1);
          }
          const fallback = { route: routeGroups[groupForRoute(state.route)].root };
          setState(fallback);
          writeHash(fallback);
          return current;
        });
      },
      canGoBack: () => history.length > 0 || state.route !== routeGroups[groupForRoute(state.route)].root,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      getParent: () => navigation,
    };
    return { ...navigation, ...state };
  }, [state, history.length, setDrawerOpen]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = <T = WebNavigation,>(): T => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context as unknown as T;
};

export const useRoute = <T = RouteProp<any, any>,>(): T => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useRoute must be used within NavigationProvider');
  return { key: context.route, name: context.route, params: context.params || {} } as T;
};

export const useCurrentRoute = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useCurrentRoute must be used within NavigationProvider');
  return context;
};
