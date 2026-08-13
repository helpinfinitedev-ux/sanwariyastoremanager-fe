import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';
import Select from '../ui/Select';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const { colors } = useTheme();

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  const pageSizeOptions = [
    { label: '10 rows', value: '10' },
    { label: '20 rows', value: '20' },
    { label: '50 rows', value: '50' },
  ];

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <View style={styles.leftContainer}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {totalCount > 0
            ? `Showing ${startItem} to ${endItem} of ${totalCount} entries`
            : 'Showing 0 to 0 of 0 entries'}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <View style={styles.pageSizeWrapper}>
          <Select
            options={pageSizeOptions}
            selectedValue={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
            containerStyle={styles.selectInput}
          />
        </View>

        <View style={styles.buttonsWrapper}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
              page <= 1 && styles.disabledBtn,
            ]}
            disabled={page <= 1}
            onPress={() => onPageChange(page - 1)}
          >
            <Ionicons name="chevron-back" size={16} color={page <= 1 ? colors.textSecondary + '50' : colors.text} />
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <Text style={[styles.pageText, { color: colors.text }]}>
              Page {page} of {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.navBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
              page >= totalPages && styles.disabledBtn,
            ]}
            disabled={page >= totalPages}
            onPress={() => onPageChange(page + 1)}
          >
            <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? colors.textSecondary + '50' : colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  leftContainer: {
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pageSizeWrapper: {
    width: 100,
  },
  selectInput: {
    marginBottom: 0,
  },
  buttonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navBtn: {
    borderWidth: 1,
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  pageIndicator: {
    paddingHorizontal: spacing.sm,
  },
  pageText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TablePagination;
