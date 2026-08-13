import { useMutation } from '@tanstack/react-query';
import { loginUser, LoginResponse } from '../services/authService.mock';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

export function useLogin() {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async ({ mobileNumber, password }: { mobileNumber: string; password: string }) => {
      const res = await loginUser(mobileNumber, password);
      if (!res.success) {
        if (res.errorCode === 'REVOKED') {
          throw new Error('Access revoked. Contact your admin.');
        } else {
          throw new Error('Invalid mobile number or password.');
        }
      }
      return res;
    },
    onSuccess: (data) => {
      if (data.success) {
        setSession(data.user, data.token);
        Toast.show({
          type: 'success',
          text1: 'Authentication Successful',
          text2: `Welcome back, ${data.user.name}!`,
        });
      }
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

  return () => {
    clearSession();
    Toast.show({
      type: 'info',
      text1: 'Logged Out',
      text2: 'You have been successfully logged out of your session.',
    });
  };
}
