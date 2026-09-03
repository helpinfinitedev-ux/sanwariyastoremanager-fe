import { db, simulateDelay } from '../../../shared/mock/mockDb';
import { Vendor, MakePaymentPayload, VendorFormInputs } from '../types/vendor.types';

export const vendorMockService = {
  getVendors: async (): Promise<Vendor[]> => {
    await simulateDelay(250);
    return db.getVendors();
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
    await simulateDelay(200);
    return db.getVendorById(id);
  },

  getVendorSummary: async (id: string) => {
    await simulateDelay(150);
    return db.getVendorSummary(id);
  },

  getVendorLedger: async (id: string) => {
    await simulateDelay(200);
    return db.getVendorLedger(id);
  },

  createVendor: async (data: VendorFormInputs): Promise<Vendor> => {
    await simulateDelay(350);
    const created = db.createVendor({
      ...data,
      contactPerson: data.name,
    });
    if (!created) throw new Error('Failed to create vendor');
    return created;
  },

  updateVendor: async (id: string, data: Partial<VendorFormInputs>): Promise<Vendor> => {
    await simulateDelay(300);
    const updated = db.updateVendor(id, data);
    if (!updated) throw new Error('Failed to update vendor');
    return updated;
  },

  makePayment: async (payload: MakePaymentPayload) => {
    await simulateDelay(350);
    return db.makeVendorPayment(payload);
  },
};
