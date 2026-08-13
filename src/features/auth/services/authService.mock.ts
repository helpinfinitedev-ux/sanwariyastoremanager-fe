import { simulateDelay } from '../../../shared/mock/mockDb';
import { UserSession } from '../store/authStore';
import { mockCredentials } from '../../../shared/mock/credentials';

export type LoginResponse =
  | { success: true; token: string; user: UserSession }
  | { success: false; errorCode: 'REVOKED' | 'INVALID_CREDENTIALS' };

/**
 * Mock Auth API Service
 */
export async function loginUser(mobileNumber: string, password: string): Promise<LoginResponse> {
  // Simulate delay between 300ms and 600ms
  const delay = Math.floor(Math.random() * 300) + 300;
  await simulateDelay(delay);

  const cleanMobile = mobileNumber.trim();
  const record = mockCredentials.find((c) => c.mobileNumber === cleanMobile);

  // Match mobile number + password
  if (!record || record.password !== password) {
    return { success: false, errorCode: 'INVALID_CREDENTIALS' };
  }

  // Check user activity state
  if (!record.isActive) {
    return { success: false, errorCode: 'REVOKED' };
  }

  // Successful login response
  return {
    success: true,
    token: `mock_jwt_token_mgr_${record.id}_${Date.now()}`,
    user: {
      id: record.id,
      name: record.managerName,
      mobileNumber: record.mobileNumber,
      role: 'STORE_MANAGER',
      storeName: record.storeName,
    },
  };
}
