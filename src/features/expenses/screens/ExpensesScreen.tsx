import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from '@/web/primitives';
import ScreenContainer from '../../../shared/components/layout/ScreenContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/ui/Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import IngredientExpensesView from '../components/IngredientExpensesView';
import OtherExpensesView from '../components/OtherExpensesView';
import { Ionicons } from '@/web/icons';

type ExpenseView = 'landing' | 'ingredient' | 'other';

export const ExpensesScreen: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeView, setActiveView] = useState<ExpenseView>('landing');

  // Sub-screen: Ingredient Purchase
  if (activeView === 'ingredient') {
    return (
      <ScreenContainer>
        <PageHeader
          title="Ingredient Purchase"
          subtitle="Purchase-based expenses from Purchase Management"
          onBack={() => setActiveView('landing')}
        />
        <View style={styles.viewContent}>
          <IngredientExpensesView />
        </View>
      </ScreenContainer>
    );
  }

  // Sub-screen: Other Expense
  if (activeView === 'other') {
    return (
      <ScreenContainer>
        <PageHeader
          title="Other Expense"
          subtitle="Manage operational expenses — electricity, gas, repair & more"
          onBack={() => setActiveView('landing')}
        />
        <View style={styles.viewContent}>
          <OtherExpensesView />
        </View>
      </ScreenContainer>
    );
  }

  // Landing page — two option cards
  return (
    <ScreenContainer>
      <PageHeader
        title="Expenses & Outlays"
        subtitle="Track all restaurant expenses in one place"
      />

      <View style={styles.landingContainer}>
        <Text style={[styles.landingPrompt, { color: colors.textSecondary }]}>
          Select an expense type to view or manage
        </Text>

        <View style={[styles.optionGrid, !isDesktop && styles.optionGridMobile]}>
          {/* Ingredient Purchase Card */}
          <Card
            style={[
              styles.optionCard,
              {
                borderColor: colors.border,
                borderLeftColor: colors.primary,
                borderLeftWidth: 4,
              },
            ]}
            onPress={() => setActiveView('ingredient')}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="basket-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Ingredient Purchase
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
              Purchase-based expenses{'\n'}View ingredient purchases
            </Text>
            <View style={[styles.optionFooter, { borderTopColor: colors.divider }]}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.optionFooterText, { color: colors.textSecondary }]}>
                Auto-synced from Purchase Management
              </Text>
            </View>
          </Card>

          {/* Other Expense Card */}
          <Card
            style={[
              styles.optionCard,
              {
                borderColor: colors.border,
                borderLeftColor: colors.warning,
                borderLeftWidth: 4,
              },
            ]}
            onPress={() => setActiveView('other')}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.warningBg }]}>
              <Ionicons name="cash-outline" size={28} color={colors.warning} />
            </View>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Other Expense
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
              Electricity, gas, repair...{'\n'}Add and manage expenses
            </Text>
            <View style={[styles.optionFooter, { borderTopColor: colors.divider }]}>
              <Ionicons name="add-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.optionFooterText, { color: colors.textSecondary }]}>
                Manually added from this section
              </Text>
            </View>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  viewContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  landingContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  landingPrompt: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: spacing.lg,
  },
  optionGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  optionGridMobile: {
    flexDirection: 'column',
  },
  optionCard: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.sm,
    cursor: 'pointer' as any,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  optionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginTop: spacing.xs,
  },
  optionFooterText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
});

export default ExpensesScreen;
