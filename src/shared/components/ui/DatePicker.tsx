import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle, TextInput } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string or YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  containerStyle,
}) => {
  const { colors } = useTheme();

  // If on web, we can inject a standard web input of type="date"
  if (Platform.OS === 'web') {
    // Render standard web date input using native DOM support
    const formattedVal = value ? value.split('T')[0] : '';
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
        )}
        <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
          <input
            type="date"
            value={formattedVal}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${error ? colors.danger : colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>
        {error && (
          <Text style={[styles.error, { color: colors.danger }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  // Fallback for native: simple text input with mask placeholder YYYY-MM-DD
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.nativePickerContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <TextInput
          style={[styles.nativeInput, { color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary + '80'}
          value={value ? value.split('T')[0] : ''}
          onChangeText={onChange}
        />
        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      )}
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
  nativePickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  nativeInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  error: {
    fontSize: 11,
    marginTop: spacing.xs - 2,
    fontWeight: '500',
  },
});

export default DatePicker;
