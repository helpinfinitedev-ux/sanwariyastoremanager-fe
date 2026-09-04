import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

interface ChartPoint {
  label: string;
  value: number;
}

interface ReportChartProps {
  data: ChartPoint[];
  title: string;
  type?: 'currency' | 'number';
}

export const ReportChart: React.FC<ReportChartProps> = ({
  data = [],
  title,
  type = 'number',
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceHover }]}>
        <Text style={{ color: colors.textSecondary }}>No data available for trend chart.</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 10);
  const chartHeight = 160;

  return (
    <View style={styles.container}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>{title}</Text>
      
      <View style={styles.chartArea}>
        <View style={styles.barsContainer}>
          {data.map((item, idx) => {
            const ratio = item.value / maxValue;
            const barHeight = Math.max(ratio * chartHeight, 6); // min height so something is visible

            return (
              <View key={`${item.label}-${idx}`} style={styles.barColumn}>
                <View style={styles.barValueWrapper}>
                  <Text style={[styles.barValText, { color: colors.textSecondary }]}>
                    {type === 'currency' ? formatCurrency(item.value) : formatNumber(item.value, 0)}
                  </Text>
                </View>
                
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        height: barHeight,
                        backgroundColor: idx % 2 === 0 ? colors.info : colors.primary,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.barLabelText, { color: colors.text }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    width: '100%',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  chartArea: {
    height: 220,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingBottom: 24, // spacing for labels
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barValueWrapper: {
    marginBottom: 4,
    height: 16,
    justifyContent: 'center',
  },
  barValText: {
    fontSize: 10,
    fontWeight: '500',
  },
  track: {
    height: 160,
    width: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabelText: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
    position: 'absolute',
    bottom: -20,
    width: 80,
  },
  emptyContainer: {
    height: 220,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReportChart;
