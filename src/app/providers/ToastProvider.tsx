import React from 'react';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { useTheme } from './ThemeProvider';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();

  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ 
          borderLeftColor: colors.success, 
          backgroundColor: colors.surface,
          width: '90%',
          maxWidth: 450,
          borderRadius: 6,
          height: 60,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        }}
        text2Style={{
          fontSize: 12,
          color: colors.textSecondary,
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ 
          borderLeftColor: colors.danger, 
          backgroundColor: colors.surface,
          width: '90%',
          maxWidth: 450,
          borderRadius: 6,
          height: 60,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        }}
        text2Style={{
          fontSize: 12,
          color: colors.textSecondary,
        }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{ 
          borderLeftColor: colors.info, 
          backgroundColor: colors.surface,
          width: '90%',
          maxWidth: 450,
          borderRadius: 6,
          height: 60,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        }}
        text2Style={{
          fontSize: 12,
          color: colors.textSecondary,
        }}
      />
    ),
  };

  return (
    <>
      {children}
      <Toast config={toastConfig} />
    </>
  );
};

export default ToastProvider;
