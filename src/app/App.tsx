import React from 'react';
import QueryProvider from './providers/QueryProvider';
import ThemeProvider from './providers/ThemeProvider';
import ToastProvider from './providers/ToastProvider';
import RootNavigator from './navigation/RootNavigator';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    #print-area {
      display: none;
    }
    @media print {
      body * {
        visibility: hidden !important;
      }
      #print-area, #print-area * {
        visibility: visible !important;
        display: block !important;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
        color: black;
        display: block !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

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
