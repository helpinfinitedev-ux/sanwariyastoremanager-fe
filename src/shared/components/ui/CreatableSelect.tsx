import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, ViewStyle, TextInput, Platform } from '@/web/primitives';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@/web/icons';

export interface SelectOption {
  label: string;
  value: string;
}

interface CreatableSelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  onCreate: (searchText: string) => void;
  createLabel?: string;
  error?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  onCreate,
  createLabel = '+ Add New Item',
  error,
  placeholder = 'Select an option',
  containerStyle,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedOption = options.find((o) => o.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
    setSearchText('');
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        style={[
          styles.selector,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.selectedValueText,
            { color: selectedOption ? colors.text : colors.textSecondary + '80' },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchText('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setSearchText('');
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {label ? `Select ${label}` : 'Select Option'}
              </Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSearchText(''); }}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input bar */}
            <View style={[styles.searchBarWrapper, { borderBottomColor: colors.divider }]}>
              <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Search items..."
                placeholderTextColor={colors.textSecondary + '80'}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={Platform.OS === 'web'}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Options list */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No items match "{searchText}"
                  </Text>
                  <TouchableOpacity
                    style={[styles.quickAddButton, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => {
                      setModalVisible(false);
                      onCreate(searchText);
                      setSearchText('');
                    }}
                  >
                    <Text style={[styles.quickAddText, { color: colors.primary }]}>
                      + Add "{searchText}" as new {label || 'item'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: isSelected ? colors.surfaceHover : 'transparent',
                        borderBottomColor: colors.divider,
                      },
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.optionsList}
            />

            {/* Persistent bottom Add New button */}
            <TouchableOpacity
              style={[styles.createButton, { borderTopColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => {
                setModalVisible(false);
                onCreate(searchText);
                setSearchText('');
              }}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.createButtonText, { color: colors.primary }]}>
                {createLabel}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  selector: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  selectedValueText: {
    fontSize: 14,
  },
  error: {
    fontSize: 11,
    marginTop: spacing.xs - 2,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 450,
    maxHeight: 450,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
  },
  clearBtn: {
    marginLeft: spacing.xs,
    padding: 2,
  },
  optionsList: {
    flexGrow: 0,
    maxHeight: 280,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  quickAddButton: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CreatableSelect;
