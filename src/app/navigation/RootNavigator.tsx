import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../../features/auth/store/authStore';
import AuthNavigator from './AuthNavigator';
import MainDrawerNavigator from './MainDrawerNavigator';
import { RootStackParamList } from './types';
import { ROUTES } from '../../shared/constants/routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen 
            name={ROUTES.MAIN.ROOT as any} 
            component={MainDrawerNavigator} 
          />
        ) : (
          <Stack.Screen 
            name={ROUTES.AUTH.ROOT as any} 
            component={AuthNavigator} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
