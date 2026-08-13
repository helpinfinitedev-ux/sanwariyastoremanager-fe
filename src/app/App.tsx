import React from 'react';
import QueryProvider from './providers/QueryProvider';
import ThemeProvider from './providers/ThemeProvider';
import ToastProvider from './providers/ToastProvider';
import RootNavigator from './navigation/RootNavigator';

export const App = () => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;
