import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../../shared/constants/routes';

interface ReportOption {
  title: string;
  desc: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export const ReportsHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;

  const reports: ReportOption[] = [
    {
      title: 'Restock Purchases Report',
      desc: 'Analyze money spent on restocking, order sizes, and vendor billing trends.',
      route: ROUTES.REPORTS_SCREENS.PURCHASE,
      icon: 'receipt',
      iconColor: colors.success,
    },
    {
      title: 'Inventory Valuation Report',
      desc: 'Audit real-time asset value distributions across products and storage categories.',
      route: ROUTES.REPORTS_SCREENS.INVENTORY,
      icon: 'cube',
      iconColor: colors.primary,
    },
    {
      title: 'Kitchen Dispatch Report',
      desc: 'Verify ingredient outflow rates and section usages over time.',
      route: ROUTES.REPORTS_SCREENS.KITCHEN_ISSUE,
      icon: 'restaurant',
      iconColor: colors.info,
    },
    {
      title: 'Waste & Loss Report',
      desc: 'Analyze food waste statistics, spoiled value metrics, and loss reason codes.',
      route: ROUTES.REPORTS_SCREENS.WASTE,
      icon: 'trash',
      iconColor: colors.danger,
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
            <TouchableOpacity
              key={rep.route}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(rep.route)}
              style={[styles.itemWrapper, { width: isDesktop ? '48%' : '100%' }]}
            >
              <Card style={styles.card}>
                <View style={[styles.iconBg, { backgroundColor: rep.iconColor + '15' }]}>
                  <Ionicons name={rep.icon} size={24} color={rep.iconColor} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: colors.text }]}>{rep.title}</Text>
                  <Text style={[styles.desc, { color: colors.textSecondary }]}>{rep.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Card>
            </TouchableOpacity>
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
