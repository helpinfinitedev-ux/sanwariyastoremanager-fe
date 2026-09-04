import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from '@/web/primitives';
import { useNavigation } from '@/web/navigation';
import { NativeStackNavigationProp } from '@/web/navigation';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import { Ionicons } from '@/web/icons';
import { ROUTES } from '../../../shared/constants/routes';
import { ReportsStackParamList } from '../../../app/navigation/types';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList>;

interface ReportOption {
  title: string;
  desc: string;
  route: keyof ReportsStackParamList;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export const ReportsHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;

  const reports: ReportOption[] = [
    {
      title: 'Restock Purchases Report',
      desc: 'Analyze money spent on restocking, order sizes, and vendor billing trends.',
      route: ROUTES.REPORTS_SCREENS.PURCHASE as keyof ReportsStackParamList,
      icon: 'receipt',
      iconColor: colors.success,
    },
    {
      title: 'Operating Expenses Report',
      desc: 'Audit operational overheads, store utilities, maintenance, and category spends.',
      route: ROUTES.REPORTS_SCREENS.EXPENSE as keyof ReportsStackParamList,
      icon: 'wallet',
      iconColor: colors.warning,
    },
    {
      title: 'Inventory Valuation Report',
      desc: 'Audit real-time asset value distributions across products and storage categories.',
      route: ROUTES.REPORTS_SCREENS.INVENTORY as keyof ReportsStackParamList,
      icon: 'cube',
      iconColor: colors.primary,
    },
    {
      title: 'Stock Movement Audit Report',
      desc: 'Audit material flux across purchases, kitchen dispatches, waste, and adjustments.',
      route: ROUTES.REPORTS_SCREENS.STOCK_MOVEMENT as keyof ReportsStackParamList,
      icon: 'swap-horizontal',
      iconColor: colors.info,
    },
    {
      title: 'Kitchen Dispatch Report',
      desc: 'Verify ingredient outflow rates and section usages over time.',
      route: ROUTES.REPORTS_SCREENS.KITCHEN_ISSUE as keyof ReportsStackParamList,
      icon: 'restaurant',
      iconColor: colors.info,
    },
    {
      title: 'Waste & Loss Report',
      desc: 'Analyze food waste statistics, spoiled value metrics, and loss reason codes.',
      route: ROUTES.REPORTS_SCREENS.WASTE as keyof ReportsStackParamList,
      icon: 'trash',
      iconColor: colors.danger,
    },
    {
      title: 'Vendor Payables & Liabilities',
      desc: 'Audit supplier procurement invoices, settled disbursements, and balance due.',
      route: ROUTES.REPORTS_SCREENS.VENDORS as keyof ReportsStackParamList,
      icon: 'people',
      iconColor: colors.primary,
    },
  ];

  return (
    <ScreenContainer title="Reports & Analytics">
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <PageHeader
          title="Store Audit Analytics"
          subtitle="Generate, review, and export operational summaries and financial asset reports"
        />

        <View style={styles.grid}>
          {reports.map((rep) => (
            <View
              key={rep.route}
              style={[styles.itemWrapper, { width: isDesktop ? '48%' : '100%' }]}
            >
              <Card
                onPress={() => navigation.navigate(rep.route as any)}
                style={styles.card}
              >
                <View style={[styles.iconBg, { backgroundColor: rep.iconColor + '15' }]}>
                  <Ionicons name={rep.icon} size={24} color={rep.iconColor} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: colors.text }]}>{rep.title}</Text>
                  <Text style={[styles.desc, { color: colors.textSecondary }]}>{rep.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  itemWrapper: {
    boxSizing: 'border-box' as any,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    cursor: 'pointer' as any,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});

export default ReportsHomeScreen;
