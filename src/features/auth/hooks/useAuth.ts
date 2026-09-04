import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/services/apiClient';
import { useAuthStore, UserSession } from '../store/authStore';
import Toast from 'react-native-toast-message';

interface BackendLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
  };
}

export function useLogin() {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async ({ mobileNumber, password }: { mobileNumber: string; password: string }) => {
      try {
        const res = await apiClient.post<BackendLoginResponse>('/auth/login', {
          phoneNumber: mobileNumber.trim(),
          password,
        });

        if (!res || !res.token) {
          throw new Error('Invalid response from server.');
        }

        const role = String(res.user?.role || '').toLowerCase();
        if (role !== 'store_manager' && role !== 'admin') {
          throw new Error('Access denied: Store Manager or Admin credentials required.');
        }

        const sessionUser: UserSession = {
          id: res.user.id,
          name: res.user.name,
          mobileNumber: res.user.phoneNumber,
          phoneNumber: res.user.phoneNumber,
          role: res.user.role,
          storeName: 'Sanwariya Restaurant',
          isActive: res.user.isActive,
        };

        return { token: res.token, user: sessionUser };
      } catch (err: any) {
        throw new Error(err.message || 'Invalid credentials or connection error.');
      }
    },
    onSuccess: (data) => {
      setSession(data.user, data.token);
      Toast.show({
        type: 'success',
        text1: 'Authentication Successful',
        text2: `Welcome back, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Please check your credentials and try again.',
      });
    },
  });
}

export function useLogout() {
  const { clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    clearSession();
    try {
      queryClient.clear();
    } catch {
      // ignore
    }
    Toast.show({
      type: 'info',
      text1: 'Logged Out',
      text2: 'You have been successfully logged out of your session.',
    });
  };
}

