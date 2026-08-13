import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  title: string;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  hideOnTablet?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowPress?: (item: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyText?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowPress,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyText = 'No records found',
  emptyActionText,
  onEmptyAction,
}: DataTableProps<T>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isTablet = width < 1024;
  const isMobile = width < 768;

  // Filter columns based on width
  const visibleColumns = columns.filter((col) => {
    if (col.hideOnTablet && isTablet) return false;
    return true;
  });

  const handleSort = (col: Column<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  const renderHeader = () => (
    <View style={[styles.headerRow, { backgroundColor: colors.surfaceHover, borderBottomColor: colors.border }]}>
      {visibleColumns.map((col) => {
        const isSorted = sortBy === col.key;
        return (
          <TouchableOpacity
            key={col.key}
            style={[
              styles.headerCell,
              { flex: col.flex || 1, justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' },
            ]}
            disabled={!col.sortable || loading}
            onPress={() => handleSort(col)}
          >
            <Text style={[styles.headerCellText, { color: colors.textSecondary }]}>
              {col.title}
            </Text>
            {col.sortable && (
              <Ionicons
                name={isSorted ? (sortOrder === 'asc' ? 'chevron-up' : 'chevron-down') : 'swap-vertical-outline'}
                size={12}
                color={isSorted ? colors.primary : colors.textSecondary + '60'}
                style={styles.sortIcon}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSkeletonRow = (index: number) => (
    <View
      key={`skeleton-${index}`}
      style={[styles.row, { borderBottomColor: colors.divider }]}
    >
      {visibleColumns.map((col) => (
        <View key={col.key} style={[styles.cell, { flex: col.flex || 1 }]}>
          <View style={[styles.skeletonText, { backgroundColor: colors.divider, width: '70%' }]} />
        </View>
      ))}
    </View>
  );

  const renderRow = ({ item }: { item: T }) => (
    <TouchableOpacity
      activeOpacity={onRowPress ? 0.7 : 1}
      onPress={() => onRowPress && onRowPress(item)}
      style={[
        styles.row,
        { borderBottomColor: colors.divider },
        onRowPress && { cursor: 'pointer' },
      ]}
    >
      {visibleColumns.map((col) => (
        <View
          key={col.key}
          style={[
            styles.cell,
            {
              flex: col.flex || 1,
              justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
            },
          ]}
        >
          {col.render ? (
            col.render(item)
          ) : (
            <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={1}>
              {String((item as any)[col.key] || '')}
            </Text>
          )}
        </View>
      ))}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { borderColor: colors.border }]}>
        {renderHeader()}
        <View style={styles.scrollContainer}>
          {[1, 2, 3, 4, 5].map((idx) => renderSkeletonRow(idx))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {renderHeader()}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRow}
        ListEmptyComponent={
          <EmptyState
            message={emptyText}
            actionText={emptyActionText}
            onAction={onEmptyAction}
          />
        }
        scrollEnabled={true}
        nestedScrollEnabled={true}
        style={styles.scrollContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
    minHeight: 250,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortIcon: {
    marginLeft: 4,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  cell: {
    paddingHorizontal: spacing.xs,
  },
  cellText: {
    fontSize: 13,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
  },
});

export default DataTable;
