import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';
import Button from '../ui/Button';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOpen?: boolean;
  onToggleFilter?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode; // Optional extra actions
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOpen = false,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters = false,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        <View style={[styles.searchWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textSecondary + '80'}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchValue ? (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {onToggleFilter && (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              { 
                borderColor: filterOpen ? colors.primary : colors.border,
                backgroundColor: filterOpen ? colors.surfaceHover : colors.surface 
              }
            ]}
            onPress={onToggleFilter}
          >
            <Ionicons name="filter" size={16} color={filterOpen ? colors.primary : colors.textSecondary} />
            <Text style={[styles.filterBtnText, { color: filterOpen ? colors.primary : colors.text }]}>
              Filters
            </Text>
            {hasActiveFilters && (
              <View style={[styles.dotIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        )}

        {hasActiveFilters && onClearFilters && (
          <TouchableOpacity onPress={onClearFilters} style={styles.clearBtn}>
            <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rightSection}>
        {children}
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
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 280,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    height: 36,
    flex: 1,
    maxWidth: 320,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    height: '100%',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    height: 36,
    gap: 6,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  clearBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

export default TableToolbar;
