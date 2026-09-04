import React from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';
import AuthNavigator from './AuthNavigator';
import MainDrawerNavigator from './MainDrawerNavigator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <MainDrawerNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
