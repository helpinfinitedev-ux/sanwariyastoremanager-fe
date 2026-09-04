import React from 'react';
import { ToastHost } from '@/web/toast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <ToastHost />
  </>
);

export default ToastProvider;
