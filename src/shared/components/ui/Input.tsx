import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  disabled,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        editable={!disabled}
        placeholderTextColor={colors.textSecondary + '80'} // 50% opacity
        {...props}
      />
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
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm - 2,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    height: 40,
  },
  error: {
    fontSize: 11,
    marginTop: spacing.xs - 2,
    fontWeight: '500',
  },
});

export default Input;
