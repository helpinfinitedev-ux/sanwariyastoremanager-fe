import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, useWindowDimensions } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import TopBar from './TopBar';

interface ScreenContainerProps {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  onMenuPress?: () => void;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  title,
  children,
  scrollable = false,
  style,
  onMenuPress,
}) => {
  const { colors } = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    style,
  ];

  return (
    <View style={styles.outer}>
      <TopBar title={title} onMenuPress={onMenuPress} />
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} style={containerStyle}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, style]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenContainer;
