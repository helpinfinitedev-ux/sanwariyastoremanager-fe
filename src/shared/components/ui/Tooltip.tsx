import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../theme/themes';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const { colors } = useTheme();

  // If on web, we can use the native title attribute for simple tooltips
  if (Platform.OS === 'web') {
    return <div title={content}>{children}</div>;
  }

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default Tooltip;
