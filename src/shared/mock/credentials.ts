export interface CredentialRecord {
  id: string;
  mobileNumber: string;
  password: string;
  role: 'STORE_MANAGER';
  isActive: boolean;
  storeName: string;
  managerName: string;
}

export const mockCredentials: CredentialRecord[] = [
  {
    id: 'mgr_01',
    mobileNumber: '1234567890',
    password: 'password123',
    role: 'STORE_MANAGER',
    isActive: true,
    storeName: 'Sanwariya Sweets - Main Branch',
    managerName: 'Amit Sharma',
  },
  {
    id: 'mgr_02',
    mobileNumber: '9876543210',
    password: 'password123',
    role: 'STORE_MANAGER',
    isActive: false,
    storeName: 'Sanwariya Sweets - Express Branch',
    managerName: 'Priya Patel',
  },
  {
    id: 'mgr_03',
    mobileNumber: '8888888888',
    password: 'password123',
    role: 'STORE_MANAGER',
    isActive: true,
    storeName: 'Sanwariya Sweets - Highway Outlet',
    managerName: 'Rajesh Kumar',
  },
];
