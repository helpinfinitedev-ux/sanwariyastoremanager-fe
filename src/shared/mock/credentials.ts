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
    id: '6a99c295532ab0702f8b37e4',
    mobileNumber: '9876500003',
    password: 'password123',
    role: 'STORE_MANAGER',
    isActive: true,
    storeName: 'Sanwariya Restaurant - Store Manager',
    managerName: 'Sanwariya Store Manager',
  },
  {
    id: '6a8b2510995b0dd3bb06c24b',
    mobileNumber: '9999999999',
    password: 'admin123',
    role: 'STORE_MANAGER',
    isActive: true,
    storeName: 'Sanwariya Restaurant - Admin',
    managerName: 'Admin User',
  },
];
