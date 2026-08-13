import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { ROUTES } from '../../shared/constants/routes';
import LoginScreen from '../../features/auth/screens/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ROUTES.AUTH.LOGIN as any} component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
