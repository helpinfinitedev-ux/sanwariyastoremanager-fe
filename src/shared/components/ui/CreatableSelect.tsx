import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    openAbove: boolean;
    maxHeight: number;
  }>({ left: 0, width: 300, openAbove: false, maxHeight: 350 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const popupHeight = 350;
    const openAbove = spaceBelow < popupHeight && spaceAbove > spaceBelow;

    const availableSpace = openAbove ? spaceAbove - 16 : spaceBelow - 16;
    const maxHeight = Math.max(160, Math.min(400, availableSpace));

    let left = rect.left;
    let width = rect.width;

    if (left + width > viewportWidth - 16) {
      width = Math.min(width, viewportWidth - 32);
      left = Math.max(16, viewportWidth - width - 16);
    }
    if (left < 16) {
      left = 16;
    }

    setPosition({
      top: openAbove ? undefined : rect.bottom + 4,
      bottom: openAbove ? viewportHeight - rect.top + 4 : undefined,
      left,
      width,
      openAbove,
      maxHeight,
    });
  }, []);

  useEffect(() => {
    if (modalVisible) {
      updatePosition();
      const handleScrollOrResize = () => {
        updatePosition();
      };
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [modalVisible, updatePosition]);

  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setModalVisible(true);
  };

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
        ref={triggerRef as any}
        activeOpacity={0.7}
        onPress={handleOpen}
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
        <View
          style={styles.modalOverlay}
          onClick={() => {
            setModalVisible(false);
            setSearchText('');
          }}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
                maxHeight: position.maxHeight,
              },
            ]}
            onClick={(e: any) => e.stopPropagation()}
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
          </View>
        </View>
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
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100001,
    backgroundColor: 'transparent',
  },
  modalContent: {
    position: 'fixed' as any,
    zIndex: 100002,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    flexShrink: 1,
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

