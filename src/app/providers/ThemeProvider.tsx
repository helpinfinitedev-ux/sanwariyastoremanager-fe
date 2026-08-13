import React, { createContext, useContext } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { lightTheme, darkTheme, ThemeColors } from '../../shared/theme/themes';
import { View, StyleSheet, StatusBar } from 'react-native';

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
}>({
  theme: 'light',
  colors: lightTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar 
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
          backgroundColor={colors.background} 
        />
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ThemeProvider;
