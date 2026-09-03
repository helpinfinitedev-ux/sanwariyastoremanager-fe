// Central in-memory database for Restaurant Store ERP

export interface Category {
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface Unit {
  name: string;
  shortCode: string;
  type?: string;
}

export interface StorageLocation {
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface Kitchen {
  name: string;
  kitchenType?: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface WasteReason {
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface Brand {
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  purchaseCost: number; // Last purchased cost
  avgCost: number;      // Average cost
  unit: string;
  brand?: string;
  storageLocation?: string;
}

export interface Vendor {
  id: string;
  firmName: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  paymentTerms: 'Cash on Delivery' | '7 Days' | '15 Days' | '30 Days' | 'Custom';
  openingBalance: number;
  status: 'Active' | 'Inactive';
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';

export interface VendorPayment {
  id: string;
  vendorId: string;
  purchaseId?: string;
  invoiceNo?: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  reference?: string;
  notes?: string;
}

export interface PurchasePaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  reference?: string;
  notes?: string;
}

export interface OtherExpense {
  id: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card' | 'Cheque' | 'Other';
  remark: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  deliveryDate: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT';
  paymentMethod?: PaymentMethod | string;
  paymentHistory?: PurchasePaymentRecord[];
  status: 'Draft' | 'Submitted';
  notes?: string;
  photoUrl?: string;
}

export interface KitchenIssueItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface KitchenIssue {
  id: string;
  date: string;
  issuedToSection: string; // e.g., 'Prep Kitchen', 'Bakery', 'Mains Section'
  issuedBy: string;
  items: KitchenIssueItem[];
  notes?: string;
}

export interface WasteEntry {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  reason: string;
  valueLost: number;
  notes?: string;
  photoUrl?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'Purchase' | 'Kitchen Issue' | 'Waste' | 'Adjustment';
  productId: string;
  productName: string;
  quantityChange: number; // Positive for Purchase/Adjustment, negative for others
  balanceAfter: number;
  referenceId: string; // Links back to PurchaseId, IssueId, or WasteId
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'purchase' | 'issue' | 'waste' | 'system';
  actor: string;
  description: string;
  referenceId?: string;
}

// ----------------------------------------------------
// SEED DATA PREPARATION
// ----------------------------------------------------

export const CATEGORIES = [
  'Fresh Produce',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Seafood',
  'Pantry & Grains',
  'Beverages',
  'Spices & Oils',
  'Packaging Materials',
];

export const KITCHEN_SECTIONS = [
  'Prep Kitchen',
  'Main Hot Kitchen',
  'Pastry & Bakery',
  'Cold Station & Salads',
  'Beverage Bar',
];

const VENDORS_SEED: Vendor[] = [
  {
    id: 'v1',
    firmName: 'Raj Traders Pvt Ltd',
    name: 'Raj Kumar',
    code: 'VND-RAJ',
    contactPerson: 'Raj Kumar',
    phone: '+91 98765 43210',
    email: 'sales@rajtraders.com',
    address: 'Sigra Main Road, Varanasi',
    gstin: '09AABCR1234M1Z5',
    paymentTerms: '15 Days',
    openingBalance: 0,
    status: 'Active',
  },
  {
    id: 'v2',
    firmName: 'Sharma Foods & Grains',
    name: 'Sanjay Sharma',
    code: 'VND-SHARMA',
    contactPerson: 'Sanjay Sharma',
    phone: '+91 98123 45678',
    email: 'orders@sharmafoods.com',
    address: 'Gola Gali, Chowk, Varanasi',
    gstin: '09BCDEF5678N2Z9',
    paymentTerms: '7 Days',
    openingBalance: 0,
    status: 'Active',
  },
  {
    id: 'v3',
    firmName: 'Apex Packaging Suppliers',
    name: 'Robert Chen',
    code: 'VND-APEX',
    contactPerson: 'Robert Chen',
    phone: '+91 97654 32109',
    email: 'accounts@apexpack.com',
    address: 'Logistics Park, Kanpur',
    gstin: '09CDEFG9012P3Z1',
    paymentTerms: '30 Days',
    openingBalance: 0,
    status: 'Active',
  },
  {
    id: 'v4',
    firmName: 'Premium Meat & Poultry Co.',
    name: 'Mark Miller',
    code: 'VND-MEAT',
    contactPerson: 'Mark Miller',
    phone: '+91 96543 21098',
    email: 'orders@premiummeat.com',
    address: 'Mahi Mandi, Varanasi',
    gstin: '09DEFGH3456Q4Z3',
    paymentTerms: 'Cash on Delivery',
    openingBalance: 0,
    status: 'Active',
  },
  {
    id: 'v5',
    firmName: 'Deluxe Dairy Distributor',
    name: 'Anna Smith',
    code: 'VND-DELUXE',
    contactPerson: 'Anna Smith',
    phone: '+91 95432 10987',
    email: 'info@deluxedairy.com',
    address: 'Dairy Colony, Lucknow',
    gstin: '09EFGHI7890R5Z7',
    paymentTerms: '15 Days',
    openingBalance: 0,
    status: 'Active',
  },
];

const PRODUCTS_SEED: Product[] = [
  { id: 'p1', sku: 'PRD-MILK-1L', name: 'Whole Milk 1L', category: 'Dairy & Eggs', currentStock: 80, minStock: 20, maxStock: 150, purchaseCost: 1.5, avgCost: 1.45, unit: 'Liters' },
  { id: 'p2', sku: 'PRD-EGG-30', name: 'Eggs Large (Tray of 30)', category: 'Dairy & Eggs', currentStock: 45, minStock: 10, maxStock: 80, purchaseCost: 4.8, avgCost: 4.6, unit: 'Trays' },
  { id: 'p3', sku: 'PRD-BUTTER-500G', name: 'Unsalted Butter 500g', category: 'Dairy & Eggs', currentStock: 30, minStock: 8, maxStock: 60, purchaseCost: 3.2, avgCost: 3.1, unit: 'Blocks' },
  { id: 'p4', sku: 'PRD-CHEESE-1KG', name: 'Mozzarella Cheese 1kg', category: 'Dairy & Eggs', currentStock: 15, minStock: 10, maxStock: 40, purchaseCost: 8.5, avgCost: 8.2, unit: 'Kgs' },
  { id: 'p5', sku: 'PRD-CHICK-1KG', name: 'Chicken Breast 1kg', category: 'Meat & Poultry', currentStock: 120, minStock: 30, maxStock: 200, purchaseCost: 5.5, avgCost: 5.4, unit: 'Kgs' },
  { id: 'p6', sku: 'PRD-BEEF-1KG', name: 'Beef Tenderloin 1kg', category: 'Meat & Poultry', currentStock: 40, minStock: 15, maxStock: 80, purchaseCost: 14.2, avgCost: 13.9, unit: 'Kgs' },
  { id: 'p7', sku: 'PRD-FLOUR-25KG', name: 'All-Purpose Flour 25kg', category: 'Pantry & Grains', currentStock: 18, minStock: 5, maxStock: 30, purchaseCost: 22.0, avgCost: 21.5, unit: 'Bags' },
  { id: 'p8', sku: 'PRD-SUGAR-10KG', name: 'White Sugar 10kg', category: 'Pantry & Grains', currentStock: 12, minStock: 4, maxStock: 25, purchaseCost: 10.5, avgCost: 10.3, unit: 'Bags' },
  { id: 'p9', sku: 'PRD-RICE-20KG', name: 'Basmati Rice 20kg', category: 'Pantry & Grains', currentStock: 8, minStock: 5, maxStock: 20, purchaseCost: 28.0, avgCost: 27.5, unit: 'Bags' },
  { id: 'p10', sku: 'PRD-TOMATO-5KG', name: 'Fresh Tomatoes (Box 5kg)', category: 'Fresh Produce', currentStock: 14, minStock: 8, maxStock: 25, purchaseCost: 6.0, avgCost: 5.8, unit: 'Boxes' },
  { id: 'p11', sku: 'PRD-ONION-10KG', name: 'Yellow Onions (Bag 10kg)', category: 'Fresh Produce', currentStock: 18, minStock: 6, maxStock: 30, purchaseCost: 7.5, avgCost: 7.2, unit: 'Bags' },
  { id: 'p12', sku: 'PRD-POTATO-10KG', name: 'Russet Potatoes (Bag 10kg)', category: 'Fresh Produce', currentStock: 22, minStock: 8, maxStock: 40, purchaseCost: 6.8, avgCost: 6.6, unit: 'Bags' },
  { id: 'p13', sku: 'PRD-SALMON-1KG', name: 'Atlantic Salmon Fillet 1kg', category: 'Seafood', currentStock: 5, minStock: 10, maxStock: 30, purchaseCost: 18.5, avgCost: 18.0, unit: 'Kgs' }, // Low stock
  { id: 'p14', sku: 'PRD-OIL-5L', name: 'Canola Frying Oil 5L', category: 'Spices & Oils', currentStock: 35, minStock: 10, maxStock: 50, purchaseCost: 12.5, avgCost: 12.2, unit: 'Bottles' },
  { id: 'p15', sku: 'PRD-BOX-PIZZA', name: 'Pizza Boxes 12in (100pcs)', category: 'Packaging Materials', currentStock: 0, minStock: 5, maxStock: 25, purchaseCost: 15.0, avgCost: 15.0, unit: 'Packs' }, // Out of stock
  { id: 'p16', sku: 'PRD-CUP-HOT', name: 'Hot Paper Cups 8oz (500pcs)', category: 'Packaging Materials', currentStock: 16, minStock: 4, maxStock: 20, purchaseCost: 24.5, avgCost: 24.0, unit: 'Packs' },
  { id: 'p17', sku: 'PRD-COLA-CAN', name: 'Cola Can 330ml (Case of 24)', category: 'Beverages', currentStock: 50, minStock: 15, maxStock: 100, purchaseCost: 11.2, avgCost: 11.0, unit: 'Cases' },
  { id: 'p18', sku: 'PRD-WATER-500ML', name: 'Mineral Water 500ml (Case 24)', category: 'Beverages', currentStock: 75, minStock: 20, maxStock: 120, purchaseCost: 6.5, avgCost: 6.4, unit: 'Cases' },
  { id: 'p19', sku: 'PRD-SPICE-OREG', name: 'Dried Oregano 500g', category: 'Spices & Oils', currentStock: 4, minStock: 2, maxStock: 10, purchaseCost: 4.5, avgCost: 4.5, unit: 'Jars' },
  { id: 'p20', sku: 'PRD-SALT-5KG', name: 'Fine Table Salt 5kg', category: 'Spices & Oils', currentStock: 6, minStock: 2, maxStock: 15, purchaseCost: 3.0, avgCost: 3.0, unit: 'Bags' },
];

// Let's seed 15 more products programmatically to hit 35 products for good pagination.
for (let i = 21; i <= 40; i++) {
  PRODUCTS_SEED.push({
    id: `p${i}`,
    sku: `PRD-ITEM-${i}`,
    name: `Ingredient Bulk Item #${i}`,
    category: CATEGORIES[i % CATEGORIES.length],
    currentStock: Math.floor(Math.random() * 60) + 10,
    minStock: 15,
    maxStock: 100,
    purchaseCost: parseFloat((Math.random() * 20 + 2).toFixed(2)),
    avgCost: parseFloat((Math.random() * 19 + 2).toFixed(2)),
    unit: i % 2 === 0 ? 'Kgs' : 'Liters',
  });
}

// ----------------------------------------------------
// DB STATE HOLDER
// ----------------------------------------------------

class InMemoryDb {
  products: Product[] = [...PRODUCTS_SEED];
  vendors: Vendor[] = [...VENDORS_SEED];
  purchases: Purchase[] = [];
  vendorPayments: VendorPayment[] = [];
  otherExpenses: OtherExpense[] = [];
  kitchenIssues: KitchenIssue[] = [];
  wasteEntries: WasteEntry[] = [];
  movements: StockMovement[] = [];
  activities: Activity[] = [];

  categories: Category[] = CATEGORIES.map(name => ({
    name,
    description: `${name} ingredients and raw materials`,
    status: 'Active',
  }));

  units: Unit[] = [
    { name: 'Kilogram', shortCode: 'Kg', type: 'Weight' },
    { name: 'Gram', shortCode: 'g', type: 'Weight' },
    { name: 'Liter', shortCode: 'L', type: 'Volume' },
    { name: 'Milliliter', shortCode: 'ml', type: 'Volume' },
    { name: 'Piece', shortCode: 'pcs', type: 'Count' },
    { name: 'Tray', shortCode: 'tray', type: 'Count' },
    { name: 'Bag', shortCode: 'bag', type: 'Count' },
  ];

  storageLocations: StorageLocation[] = [
    { name: 'Dry Store', description: 'Dry goods storage', status: 'Active' },
    { name: 'Cold Storage', description: 'Refrigerated walk-in', status: 'Active' },
    { name: 'Freezer', description: 'Frozen walk-in', status: 'Active' },
    { name: 'Vegetable Store', description: 'Fresh vegetables and fruits store', status: 'Active' },
    { name: 'Beverage Store', description: 'Beverages storage', status: 'Active' },
  ];

  kitchens: Kitchen[] = KITCHEN_SECTIONS.map(name => ({
    name,
    kitchenType: name.includes('Bar') ? 'Beverage' : name.includes('Bakery') ? 'Baking' : 'Preparation',
    description: `${name} department`,
    status: 'Active',
  }));

  wasteReasons: WasteReason[] = [
    { name: 'Expired', description: 'Passed product expiry date', status: 'Active' },
    { name: 'Spoiled', description: 'Soured, spoiled, or rotten food', status: 'Active' },
    { name: 'Damaged', description: 'Container damaged or items dropped', status: 'Active' },
    { name: 'Overproduction', description: 'Prepared in excess of daily demand', status: 'Active' },
    { name: 'Other', description: 'Miscellaneous loss categories', status: 'Active' },
  ];

  brands: Brand[] = [
    { name: 'Nestle' },
    { name: 'Amul' },
    { name: 'Generic' },
    { name: 'Metro Quality' },
  ];

  constructor() {
    this.seedOperations();
  }

  // Pre-seed some operations to show historical graphs & tables on load
  private seedOperations() {
    // 1. Pre-seed Purchases with payment details
    const initialPurchases: Purchase[] = [
      {
        id: 'po-1001',
        invoiceNo: 'INV-2026-001',
        vendorId: 'v1',
        vendorName: 'Raj Traders Pvt Ltd',
        orderDate: '2026-09-01T10:00:00Z',
        deliveryDate: '2026-09-01T15:00:00Z',
        totalAmount: 20000,
        paidAmount: 20000,
        dueAmount: 0,
        paymentStatus: 'PAID',
        paymentMethod: 'Bank Transfer',
        status: 'Submitted',
        notes: 'Monthly staples restock - Sugar & Flour',
        items: [
          { productId: 'p8', productName: 'White Sugar 10kg', quantity: 50, unitCost: 45, subtotal: 2250 },
          { productId: 'p7', productName: 'All-Purpose Flour 25kg', quantity: 20, unitCost: 550, subtotal: 11000 },
          { productId: 'p14', productName: 'Canola Frying Oil 5L', quantity: 10, unitCost: 675, subtotal: 6750 },
        ],
      },
      {
        id: 'po-1002',
        invoiceNo: 'INV-2026-002',
        vendorId: 'v1',
        vendorName: 'Raj Traders Pvt Ltd',
        orderDate: '2026-09-05T11:30:00Z',
        deliveryDate: '2026-09-05T16:00:00Z',
        totalAmount: 35000,
        paidAmount: 15000,
        dueAmount: 20000,
        paymentStatus: 'PARTIAL',
        paymentMethod: 'Cash',
        status: 'Submitted',
        notes: 'Bulk Sugar & Rice restock',
        items: [
          { productId: 'p8', productName: 'White Sugar 10kg', quantity: 40, unitCost: 45, subtotal: 1800 },
          { productId: 'p9', productName: 'Basmati Rice 20kg', quantity: 20, unitCost: 1660, subtotal: 33200 },
        ],
      },
      {
        id: 'po-1003',
        invoiceNo: 'INV-2026-003',
        vendorId: 'v2',
        vendorName: 'Sharma Foods & Grains',
        orderDate: '2026-09-02T09:00:00Z',
        deliveryDate: '2026-09-02T14:00:00Z',
        totalAmount: 18500,
        paidAmount: 18500,
        dueAmount: 0,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        status: 'Submitted',
        notes: 'Spices & Cooking Oil',
        items: [
          { productId: 'p14', productName: 'Canola Frying Oil 5L', quantity: 20, unitCost: 625, subtotal: 12500 },
          { productId: 'p20', productName: 'Fine Table Salt 5kg', quantity: 20, unitCost: 300, subtotal: 6000 },
        ],
      },
      {
        id: 'po-1004',
        invoiceNo: 'INV-2026-004',
        vendorId: 'v2',
        vendorName: 'Sharma Foods & Grains',
        orderDate: '2026-09-09T14:00:00Z',
        deliveryDate: '2026-09-09T18:00:00Z',
        totalAmount: 12000,
        paidAmount: 4000,
        dueAmount: 8000,
        paymentStatus: 'PARTIAL',
        paymentMethod: 'Cash',
        status: 'Submitted',
        notes: 'Sugar & Spices',
        items: [
          { productId: 'p8', productName: 'White Sugar 10kg', quantity: 60, unitCost: 45, subtotal: 2700 },
          { productId: 'p19', productName: 'Dried Oregano 500g', quantity: 15, unitCost: 620, subtotal: 9300 },
        ],
      },
      {
        id: 'po-1005',
        invoiceNo: 'INV-2026-005',
        vendorId: 'v3',
        vendorName: 'Apex Packaging Suppliers',
        orderDate: '2026-09-04T10:00:00Z',
        deliveryDate: '2026-09-04T15:00:00Z',
        totalAmount: 15400,
        paidAmount: 0,
        dueAmount: 15400,
        paymentStatus: 'CREDIT',
        status: 'Submitted',
        notes: 'Pizza Boxes & Paper Cups delivery',
        items: [
          { productId: 'p15', productName: 'Pizza Boxes 12in (100pcs)', quantity: 10, unitCost: 750, subtotal: 7500 },
          { productId: 'p16', productName: 'Hot Paper Cups 8oz (500pcs)', quantity: 5, unitCost: 1580, subtotal: 7900 },
        ],
      },
      {
        id: 'po-1006',
        invoiceNo: 'INV-2026-006',
        vendorId: 'v4',
        vendorName: 'Premium Meat & Poultry Co.',
        orderDate: '2026-09-06T08:30:00Z',
        deliveryDate: '2026-09-06T12:00:00Z',
        totalAmount: 24500,
        paidAmount: 24500,
        dueAmount: 0,
        paymentStatus: 'PAID',
        paymentMethod: 'Cash',
        status: 'Submitted',
        notes: 'Fresh Chicken & Beef supply',
        items: [
          { productId: 'p5', productName: 'Chicken Breast 1kg', quantity: 50, unitCost: 280, subtotal: 14000 },
          { productId: 'p6', productName: 'Beef Tenderloin 1kg', quantity: 15, unitCost: 700, subtotal: 10500 },
        ],
      },
      {
        id: 'po-1007',
        invoiceNo: 'INV-2026-007',
        vendorId: 'v5',
        vendorName: 'Deluxe Dairy Distributor',
        orderDate: '2026-09-07T07:30:00Z',
        deliveryDate: '2026-09-07T10:00:00Z',
        totalAmount: 14600,
        paidAmount: 6000,
        dueAmount: 8600,
        paymentStatus: 'PARTIAL',
        paymentMethod: 'UPI',
        status: 'Submitted',
        notes: 'Milk, Butter & Cheese delivery',
        items: [
          { productId: 'p1', productName: 'Whole Milk 1L', quantity: 100, unitCost: 60, subtotal: 6000 },
          { productId: 'p3', productName: 'Unsalted Butter 500g', quantity: 20, unitCost: 230, subtotal: 4600 },
          { productId: 'p4', productName: 'Mozzarella Cheese 1kg', quantity: 8, unitCost: 500, subtotal: 4000 },
        ],
      },
      {
        id: 'po-1008',
        invoiceNo: 'INV-2026-008',
        vendorId: 'v1',
        vendorName: 'Raj Traders Pvt Ltd',
        orderDate: '2026-09-15T10:00:00Z',
        deliveryDate: '2026-09-15T14:00:00Z',
        totalAmount: 18000,
        paidAmount: 9000,
        dueAmount: 9000,
        paymentStatus: 'PARTIAL',
        paymentMethod: 'Bank Transfer',
        status: 'Submitted',
        notes: 'Sugar & Grain restock mid-month',
        items: [
          { productId: 'p8', productName: 'White Sugar 10kg', quantity: 100, unitCost: 45, subtotal: 4500 },
          { productId: 'p7', productName: 'All-Purpose Flour 25kg', quantity: 25, unitCost: 540, subtotal: 13500 },
        ],
      },
    ];

    this.purchases = initialPurchases;

    // Seed initial Payments
    this.vendorPayments = [
      {
        id: 'vp-101',
        vendorId: 'v1',
        purchaseId: 'po-1001',
        invoiceNo: 'INV-2026-001',
        date: '2026-09-01T15:30:00Z',
        amount: 20000,
        paymentMethod: 'Bank Transfer',
        reference: 'UTR9812739182',
        notes: 'Full payment for INV-2026-001',
      },
      {
        id: 'vp-102',
        vendorId: 'v1',
        purchaseId: 'po-1002',
        invoiceNo: 'INV-2026-002',
        date: '2026-09-05T16:30:00Z',
        amount: 15000,
        paymentMethod: 'Cash',
        reference: 'CASH-REC-05',
        notes: 'Advance partial payment for INV-2026-002',
      },
      {
        id: 'vp-103',
        vendorId: 'v2',
        purchaseId: 'po-1003',
        invoiceNo: 'INV-2026-003',
        date: '2026-09-02T14:30:00Z',
        amount: 18500,
        paymentMethod: 'UPI',
        reference: 'UPI/9817293817/Sharma',
        notes: 'Paid via PhonePe UPI',
      },
      {
        id: 'vp-104',
        vendorId: 'v2',
        purchaseId: 'po-1004',
        invoiceNo: 'INV-2026-004',
        date: '2026-09-09T18:30:00Z',
        amount: 4000,
        paymentMethod: 'Cash',
        notes: 'Partial payment on delivery',
      },
      {
        id: 'vp-105',
        vendorId: 'v1',
        purchaseId: 'po-1008',
        invoiceNo: 'INV-2026-008',
        date: '2026-09-15T15:00:00Z',
        amount: 9000,
        paymentMethod: 'Bank Transfer',
        reference: 'UTR8871625341',
        notes: 'Half payment for mid-month sugar batch',
      },
    ];

    // Populate initial paymentHistory on purchases
    initialPurchases.forEach(p => {
      const payments = this.vendorPayments.filter(vp => vp.purchaseId === p.id);
      p.paymentHistory = payments.map(vp => ({
        id: vp.id,
        date: vp.date,
        amount: vp.amount,
        paymentMethod: vp.paymentMethod,
        reference: vp.reference,
        notes: vp.notes,
      }));
    });

    // Seed 10+ Other Expenses
    this.otherExpenses = [
      {
        id: 'exp-1',
        category: 'Electricity',
        amount: 8500,
        date: '2026-09-01T10:00:00Z',
        paymentMethod: 'Bank Transfer',
        remark: 'September electricity bill for main dining & store room',
      },
      {
        id: 'exp-2',
        category: 'Gas',
        amount: 4200,
        date: '2026-09-02T11:15:00Z',
        paymentMethod: 'Cash',
        remark: 'Commercial LPG cylinder refill (3 cylinders)',
      },
      {
        id: 'exp-3',
        category: 'Transport',
        amount: 1200,
        date: '2026-09-03T14:00:00Z',
        paymentMethod: 'Cash',
        remark: 'Raw material auto transport from Mandi',
      },
      {
        id: 'exp-4',
        category: 'Repair',
        amount: 2500,
        date: '2026-09-04T16:30:00Z',
        paymentMethod: 'UPI',
        remark: 'Refrigerator compressor servicing and gas refill',
      },
      {
        id: 'exp-5',
        category: 'Cleaning',
        amount: 1800,
        date: '2026-09-05T09:00:00Z',
        paymentMethod: 'Cash',
        remark: 'Store room pest control & deep cleaning chemical purchase',
      },
      {
        id: 'exp-6',
        category: 'Maintenance',
        amount: 3200,
        date: '2026-09-06T12:00:00Z',
        paymentMethod: 'UPI',
        remark: 'Exhaust fan belt replacement & kitchen hood maintenance',
      },
      {
        id: 'exp-7',
        category: 'Salary',
        amount: 15000,
        date: '2026-09-07T10:00:00Z',
        paymentMethod: 'Bank Transfer',
        remark: 'Helper staff advance salary payout',
      },
      {
        id: 'exp-8',
        category: 'Office',
        amount: 950,
        date: '2026-09-08T15:00:00Z',
        paymentMethod: 'Cash',
        remark: 'Billing thermal paper rolls & printer ink cartridges',
      },
      {
        id: 'exp-9',
        category: 'Gas',
        amount: 2800,
        date: '2026-09-10T11:00:00Z',
        paymentMethod: 'Cash',
        remark: 'Emergency LPG cylinder replacement',
      },
      {
        id: 'exp-10',
        category: 'Miscellaneous',
        amount: 650,
        date: '2026-09-12T17:00:00Z',
        paymentMethod: 'Cash',
        remark: 'Tea, coffee, and refreshments for store delivery drivers',
      },
    ];

    // Apply stock change for submitted purchases in seed
    initialPurchases.forEach(p => {
      if (p.status === 'Submitted') {
        p.items.forEach(item => {
          const prod = this.products.find(pr => pr.id === item.productId);
          if (prod) {
            this.movements.push({
              id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
              date: p.orderDate,
              type: 'Purchase',
              productId: item.productId,
              productName: prod.name,
              quantityChange: item.quantity,
              balanceAfter: prod.currentStock,
              referenceId: p.id,
            });
          }
        });
        this.activities.push({
          id: `act-${p.id}`,
          timestamp: p.orderDate,
          type: 'purchase',
          actor: 'Store Manager',
          description: `Received purchase delivery from ${p.vendorName}. Invoice: ${p.invoiceNo}. Total: ₹${p.totalAmount.toLocaleString('en-IN')}`,
          referenceId: p.id,
        });
      }
    });

    // 2. Pre-seed Kitchen Issues
    const initialIssues: KitchenIssue[] = [
      {
        id: 'iss-101',
        date: '2026-08-02T11:00:00Z',
        issuedToSection: 'Prep Kitchen',
        issuedBy: 'Store Manager',
        items: [
          { productId: 'p10', productName: 'Fresh Tomatoes (Box 5kg)', quantity: 4 },
          { productId: 'p11', productName: 'Yellow Onions (Bag 10kg)', quantity: 2 },
          { productId: 'p5', productName: 'Chicken Breast 1kg', quantity: 20 },
        ],
      },
      {
        id: 'iss-102',
        date: '2026-08-04T16:30:00Z',
        issuedToSection: 'Pastry & Bakery',
        issuedBy: 'Store Manager',
        items: [
          { productId: 'p7', productName: 'All-Purpose Flour 25kg', quantity: 2 },
          { productId: 'p3', productName: 'Unsalted Butter 500g', quantity: 10 },
          { productId: 'p2', productName: 'Eggs Large (Tray of 30)', quantity: 4 },
        ],
      },
    ];

    this.kitchenIssues = initialIssues;
    initialIssues.forEach(iss => {
      iss.items.forEach(item => {
        const prod = this.products.find(pr => pr.id === item.productId);
        if (prod) {
          this.movements.push({
            id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
            date: iss.date,
            type: 'Kitchen Issue',
            productId: item.productId,
            productName: prod.name,
            quantityChange: -item.quantity,
            balanceAfter: prod.currentStock + 5, // Approximate balance after historical issue
            referenceId: iss.id,
          });
        }
      });
      this.activities.push({
        id: `act-${iss.id}`,
        timestamp: iss.date,
        type: 'issue',
        actor: 'Store Manager',
        description: `Issued items to ${iss.issuedToSection}`,
        referenceId: iss.id,
      });
    });

    // 3. Pre-seed Waste Entries
    const initialWaste: WasteEntry[] = [
      {
        id: 'wst-201',
        date: '2026-08-03T17:00:00Z',
        productId: 'p10',
        productName: 'Fresh Tomatoes (Box 5kg)',
        quantity: 2,
        unit: 'Boxes',
        reason: 'Spoiled',
        valueLost: 12.0,
        notes: 'Tomatoes showed signs of rot due to high ambient temperature in storage.',
      },
      {
        id: 'wst-202',
        date: '2026-08-05T20:15:00Z',
        productId: 'p1',
        productName: 'Whole Milk 1L',
        quantity: 4,
        unit: 'Liters',
        reason: 'Expired',
        valueLost: 6.0,
        notes: 'Passed best before date.',
      },
    ];

    this.wasteEntries = initialWaste;
    initialWaste.forEach(w => {
      const prod = this.products.find(pr => pr.id === w.productId);
      if (prod) {
        this.movements.push({
          id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
          date: w.date,
          type: 'Waste',
          productId: w.productId,
          productName: prod.name,
          quantityChange: -w.quantity,
          balanceAfter: prod.currentStock,
          referenceId: w.id,
        });
      }
      this.activities.push({
        id: `act-${w.id}`,
        timestamp: w.date,
        type: 'waste',
        actor: 'Store Manager',
        description: `Logged waste entry for ${w.quantity} ${w.unit} of ${w.productName} due to ${w.reason}`,
        referenceId: w.id,
      });
    });

    // Sort movements chronologically
    this.movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // ----------------------------------------------------
  // MUTATIONS (REAL INTERNALS)
  // ----------------------------------------------------

  createPurchase(purchaseData: Omit<Purchase, 'id' | 'vendorName' | 'totalAmount' | 'paidAmount' | 'dueAmount' | 'paymentStatus'> & { paidAmount?: number; paymentMethod?: PaymentMethod | string }) {
    const id = `po-${Math.floor(1000 + Math.random() * 9000)}`;
    const vendor = this.vendors.find(v => v.id === purchaseData.vendorId);
    const vendorName = vendor ? (vendor.firmName || vendor.name) : 'Unknown Vendor';
    
    // Auto calculate totals
    const items = purchaseData.items.map(item => {
      const prod = this.products.find(pr => pr.id === item.productId);
      const name = prod ? prod.name : 'Unknown Product';
      const cost = item.unitCost;
      return {
        ...item,
        productName: name,
        subtotal: parseFloat((item.quantity * cost).toFixed(2)),
      };
    });

    const totalAmount = parseFloat(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const paidAmount = Math.min(totalAmount, Number(purchaseData.paidAmount) || 0);
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    
    let paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT' = 'CREDIT';
    if (dueAmount === 0 && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    const paymentHistory: PurchasePaymentRecord[] = [];
    if (paidAmount > 0) {
      const paymentRecord: PurchasePaymentRecord = {
        id: `vp-${Math.floor(100 + Math.random() * 900)}`,
        date: purchaseData.orderDate || new Date().toISOString(),
        amount: paidAmount,
        paymentMethod: purchaseData.paymentMethod || 'Cash',
        reference: `INIT-${purchaseData.invoiceNo || 'INV'}`,
        notes: `Initial payment for invoice ${purchaseData.invoiceNo}`,
      };
      paymentHistory.push(paymentRecord);
      this.vendorPayments.unshift({
        id: paymentRecord.id,
        vendorId: purchaseData.vendorId,
        purchaseId: id,
        invoiceNo: purchaseData.invoiceNo,
        date: paymentRecord.date,
        amount: paidAmount,
        paymentMethod: paymentRecord.paymentMethod,
        notes: paymentRecord.notes,
        reference: paymentRecord.reference,
      });
    }

    const newPurchase: Purchase = {
      ...purchaseData,
      id,
      vendorName,
      items,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod: purchaseData.paymentMethod,
      paymentHistory,
    };

    this.purchases.unshift(newPurchase);

    // If submitted, perform stock adjustment & log movements
    if (newPurchase.status === 'Submitted') {
      this.processSubmittedPurchase(newPurchase);
    } else {
      this.logActivity('purchase', `Created draft purchase order for ${vendorName}`, id);
    }

    return newPurchase;
  }

  updatePurchase(id: string, updates: Partial<Purchase>) {
    const idx = this.purchases.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Purchase not found');

    const original = this.purchases[idx];
    
    if (original.status === 'Submitted' && updates.status === 'Draft') {
      throw new Error('Cannot revert a submitted purchase to draft status');
    }

    const updatedItems = updates.items 
      ? updates.items.map(item => {
          const prod = this.products.find(pr => pr.id === item.productId);
          return {
            ...item,
            productName: prod ? prod.name : item.productName,
            subtotal: parseFloat((item.quantity * item.unitCost).toFixed(2)),
          };
        })
      : original.items;

    const totalAmount = parseFloat(updatedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const paidAmount = updates.paidAmount !== undefined ? Math.min(totalAmount, Number(updates.paidAmount)) : original.paidAmount;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT' = 'CREDIT';
    if (dueAmount === 0 && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    let paymentHistory = original.paymentHistory || [];
    if (updates.paidAmount !== undefined && updates.paidAmount > original.paidAmount) {
      const diff = updates.paidAmount - original.paidAmount;
      const additionalRecord: PurchasePaymentRecord = {
        id: `vp-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString(),
        amount: diff,
        paymentMethod: updates.paymentMethod || original.paymentMethod || 'Cash',
        reference: `UPDATE-${original.invoiceNo}`,
        notes: `Additional payment during invoice edit`,
      };
      paymentHistory = [additionalRecord, ...paymentHistory];
      this.vendorPayments.unshift({
        id: additionalRecord.id,
        vendorId: original.vendorId,
        purchaseId: original.id,
        invoiceNo: original.invoiceNo,
        date: additionalRecord.date,
        amount: diff,
        paymentMethod: additionalRecord.paymentMethod,
        notes: additionalRecord.notes,
        reference: additionalRecord.reference,
      });
    }

    const updatedVendor = updates.vendorId ? this.vendors.find(v => v.id === updates.vendorId) : undefined;
    const vendorName = updatedVendor ? (updatedVendor.firmName || updatedVendor.name) : original.vendorName;

    this.purchases[idx] = {
      ...original,
      ...updates,
      vendorName,
      items: updatedItems,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentHistory,
    };

    if (original.status === 'Draft' && updates.status === 'Submitted') {
      this.processSubmittedPurchase(this.purchases[idx]);
    }

    return this.purchases[idx];
  }

  private processSubmittedPurchase(p: Purchase) {
    p.items.forEach(item => {
      const prod = this.products.find(pr => pr.id === item.productId);
      if (prod) {
        // Adjust stock
        const previousStock = prod.currentStock;
        prod.currentStock = previousStock + item.quantity;
        prod.purchaseCost = item.unitCost;
        
        // Recalculate average cost: (prevStock * prevAvg + newQty * newCost) / (prevStock + newQty)
        const totalCostBasis = (previousStock * prod.avgCost) + (item.quantity * item.unitCost);
        prod.avgCost = parseFloat((totalCostBasis / prod.currentStock).toFixed(2)) || item.unitCost;

        // Log Movement
        this.movements.unshift({
          id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          type: 'Purchase',
          productId: item.productId,
          productName: prod.name,
          quantityChange: item.quantity,
          balanceAfter: prod.currentStock,
          referenceId: p.id,
        });
      }
    });

    this.logActivity('purchase', `Received delivery & restocked items from ${p.vendorName}. Invoice: ${p.invoiceNo}`, p.id);
  }

  // 2. Kitchen Issue Operations
  createKitchenIssue(issueData: Omit<KitchenIssue, 'id' | 'date'>) {
    const id = `iss-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString();

    const items = issueData.items.map(item => {
      const prod = this.products.find(pr => pr.id === item.productId);
      return {
        ...item,
        productName: prod ? prod.name : 'Unknown Product',
      };
    });

    // Check stock levels first
    items.forEach(item => {
      const prod = this.products.find(pr => pr.id === item.productId);
      if (!prod || prod.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${prod ? prod.name : 'item'}. Available: ${prod ? prod.currentStock : 0}`);
      }
    });

    const newIssue: KitchenIssue = {
      ...issueData,
      id,
      date,
      items,
    };

    // Deduct stocks & log movements
    newIssue.items.forEach(item => {
      const prod = this.products.find(pr => pr.id === item.productId);
      if (prod) {
        prod.currentStock -= item.quantity;

        this.movements.unshift({
          id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
          date,
          type: 'Kitchen Issue',
          productId: item.productId,
          productName: prod.name,
          quantityChange: -item.quantity,
          balanceAfter: prod.currentStock,
          referenceId: id,
        });
      }
    });

    this.kitchenIssues.unshift(newIssue);
    this.logActivity('issue', `Issued ingredients to ${newIssue.issuedToSection}`, id);

    return newIssue;
  }

  // 3. Waste Operations
  createWasteEntry(wasteData: Omit<WasteEntry, 'id' | 'date' | 'productName' | 'unit' | 'valueLost'>) {
    const id = `wst-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString();
    const prod = this.products.find(p => p.id === wasteData.productId);

    if (!prod) throw new Error('Product not found');
    if (prod.currentStock < wasteData.quantity) {
      throw new Error(`Cannot log waste: entry quantity exceeds current stock of ${prod.name}`);
    }

    const valueLost = parseFloat((wasteData.quantity * prod.avgCost).toFixed(2));
    
    const newWaste: WasteEntry = {
      ...wasteData,
      id,
      date,
      productName: prod.name,
      unit: prod.unit,
      valueLost,
    };

    // Deduct stock
    prod.currentStock -= wasteData.quantity;

    // Log Stock Movement
    this.movements.unshift({
      id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
      date,
      type: 'Waste',
      productId: wasteData.productId,
      productName: prod.name,
      quantityChange: -wasteData.quantity,
      balanceAfter: prod.currentStock,
      referenceId: id,
    });

    this.wasteEntries.unshift(newWaste);
    this.logActivity('waste', `Logged waste: ${wasteData.quantity} ${prod.unit} of ${prod.name} (${wasteData.reason})`, id);

    return newWaste;
  }

  createProduct(productData: {
    name: string;
    category: string;
    unit: string;
    minStock?: number;
    purchaseCost?: number;
    brand?: string;
    storageLocation?: string;
  }) {
    const exists = this.products.some(p => p.name.trim().toLowerCase() === productData.name.trim().toLowerCase());
    if (exists) throw new Error('Product already exists.');

    const id = `p${this.products.length + 1}`;
    const namePart = productData.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const sku = `PRD-${namePart || 'ITEM'}-${Math.floor(100 + Math.random() * 900)}`;

    const newProd: Product = {
      id,
      sku,
      name: productData.name.trim(),
      category: productData.category,
      unit: productData.unit,
      currentStock: 0,
      minStock: Number(productData.minStock) || 0,
      maxStock: 100,
      purchaseCost: Number(productData.purchaseCost) || 0,
      avgCost: Number(productData.purchaseCost) || 0,
      brand: productData.brand || 'Generic',
      storageLocation: productData.storageLocation || 'Dry Store',
    };

    this.products.push(newProd);
    this.logActivity('system', `Added new product ingredient: ${newProd.name} (${newProd.sku})`);
    return newProd;
  }

  createCategory(category: Category) {
    const exists = this.categories.some(c => c.name.trim().toLowerCase() === category.name.trim().toLowerCase());
    if (exists) throw new Error('Category already exists.');
    
    const newCategory = {
      ...category,
      name: category.name.trim(),
    };
    this.categories.push(newCategory);
    this.logActivity('system', `Created new product category: ${newCategory.name}`);
    return newCategory;
  }

  createUnit(unit: Unit) {
    const exists = this.units.some(u => 
      u.name.trim().toLowerCase() === unit.name.trim().toLowerCase() ||
      u.shortCode.trim().toLowerCase() === unit.shortCode.trim().toLowerCase()
    );
    if (exists) throw new Error('Unit already exists.');

    const newUnit = {
      ...unit,
      name: unit.name.trim(),
      shortCode: unit.shortCode.trim(),
    };
    this.units.push(newUnit);
    this.logActivity('system', `Created new unit: ${newUnit.name} (${newUnit.shortCode})`);
    return newUnit;
  }

  createStorageLocation(location: StorageLocation) {
    const exists = this.storageLocations.some(l => l.name.trim().toLowerCase() === location.name.trim().toLowerCase());
    if (exists) throw new Error('Location already exists.');

    const newLocation = {
      ...location,
      name: location.name.trim(),
    };
    this.storageLocations.push(newLocation);
    this.logActivity('system', `Created new storage location: ${newLocation.name}`);
    return newLocation;
  }

  createKitchen(kitchen: Kitchen) {
    const exists = this.kitchens.some(k => k.name.trim().toLowerCase() === kitchen.name.trim().toLowerCase());
    if (exists) throw new Error('Kitchen already exists.');

    const newKitchen = {
      ...kitchen,
      name: kitchen.name.trim(),
    };
    this.kitchens.push(newKitchen);
    this.logActivity('system', `Created new kitchen department: ${newKitchen.name}`);
    return newKitchen;
  }

  createWasteReason(reason: WasteReason) {
    const exists = this.wasteReasons.some(r => r.name.trim().toLowerCase() === reason.name.trim().toLowerCase());
    if (exists) throw new Error('Waste Reason already exists.');

    const newReason = {
      ...reason,
      name: reason.name.trim(),
    };
    this.wasteReasons.push(newReason);
    this.logActivity('system', `Created new waste reason: ${newReason.name}`);
    return newReason;
  }

  // ----------------------------------------------------
  // VENDOR & EXPENSES EXTENDED OPERATIONS
  // ----------------------------------------------------

  getVendors() {
    return this.vendors.map(v => {
      const summary = this.getVendorSummary(v.id);
      return {
        ...v,
        totalPurchase: summary.totalPurchase,
        totalPaid: summary.totalPaid,
        outstanding: summary.outstanding,
      };
    });
  }

  getVendorById(id: string) {
    const v = this.vendors.find(item => item.id === id);
    if (!v) return undefined;
    const summary = this.getVendorSummary(v.id);
    return {
      ...v,
      totalPurchase: summary.totalPurchase,
      totalPaid: summary.totalPaid,
      outstanding: summary.outstanding,
    };
  }

  createVendor(vendorData: Omit<Vendor, 'id' | 'code' | 'status'> & { status?: 'Active' | 'Inactive' }) {
    const exists = this.vendors.some(v => v.firmName.trim().toLowerCase() === vendorData.firmName.trim().toLowerCase());
    if (exists) throw new Error('Vendor with this Firm Name already exists.');

    const id = `v${this.vendors.length + 1}`;
    const code = `VND-${vendorData.firmName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5)}`;
    
    const newVendor: Vendor = {
      ...vendorData,
      id,
      code,
      status: vendorData.status || 'Active',
      firmName: vendorData.firmName.trim(),
      name: vendorData.name.trim(),
      openingBalance: Number(vendorData.openingBalance) || 0,
    };
    this.vendors.push(newVendor);
    this.logActivity('system', `Added new vendor firm: ${newVendor.firmName} (${newVendor.name})`);
    return this.getVendorById(id) as Vendor;
  }

  createSupplier(vendorData: Omit<Vendor, 'id' | 'code' | 'status'> & { status?: 'Active' | 'Inactive' }) {
    return this.createVendor(vendorData);
  }

  updateVendor(id: string, vendorData: Partial<Vendor>) {
    const index = this.vendors.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vendor not found.');

    this.vendors[index] = {
      ...this.vendors[index],
      ...vendorData,
    };
    this.logActivity('system', `Updated vendor details for: ${this.vendors[index].firmName}`);
    return this.getVendorById(id);
  }

  getVendorSummary(vendorId: string) {
    const vendorPurchases = this.purchases.filter(p => p.vendorId === vendorId && p.status === 'Submitted');
    const totalPurchase = vendorPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = vendorPurchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const outstanding = vendorPurchases.reduce((sum, p) => sum + (p.dueAmount || 0), 0);

    return {
      totalPurchase,
      totalPaid,
      outstanding,
    };
  }

  getVendorLedger(vendorId: string) {
    // Collect all purchases & payments for vendor
    const vendorPurchases = this.purchases.filter(p => p.vendorId === vendorId && p.status === 'Submitted');
    const vendorPayments = this.vendorPayments.filter(p => p.vendorId === vendorId);

    type LedgerEntry = {
      id: string;
      date: string;
      type: 'Purchase' | 'Payment';
      reference: string;
      purchaseAmount: number;
      paymentAmount: number;
      balance: number;
      notes?: string;
    };

    const entries: Omit<LedgerEntry, 'balance'>[] = [];

    vendorPurchases.forEach(p => {
      entries.push({
        id: p.id,
        date: p.orderDate,
        type: 'Purchase',
        reference: p.invoiceNo || p.id,
        purchaseAmount: p.totalAmount,
        paymentAmount: 0,
        notes: `Purchase (${p.items.length} items)`,
      });
    });

    vendorPayments.forEach(pm => {
      entries.push({
        id: pm.id,
        date: pm.date,
        type: 'Payment',
        reference: pm.invoiceNo ? `Payment (${pm.invoiceNo})` : pm.reference || 'Payment',
        purchaseAmount: 0,
        paymentAmount: pm.amount,
        notes: pm.notes || `Paid via ${pm.paymentMethod}`,
      });
    });

    // Sort chronologically ascending
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const ledger: LedgerEntry[] = entries.map(entry => {
      runningBalance = runningBalance + entry.purchaseAmount - entry.paymentAmount;
      return {
        ...entry,
        balance: Math.max(0, runningBalance),
      };
    });

    return ledger;
  }

  makeVendorPayment(paymentData: {
    vendorId: string;
    purchaseId?: string;
    invoiceNo?: string;
    amount: number;
    paymentMethod: PaymentMethod | string;
    reference?: string;
    notes?: string;
    date?: string;
  }) {
    const vendor = this.vendors.find(v => v.id === paymentData.vendorId);
    if (!vendor) throw new Error('Vendor not found.');

    const date = paymentData.date || new Date().toISOString();
    const id = `vp-${Math.floor(100 + Math.random() * 900)}`;

    const newPayment: VendorPayment = {
      id,
      vendorId: paymentData.vendorId,
      purchaseId: paymentData.purchaseId,
      invoiceNo: paymentData.invoiceNo,
      date,
      amount: Number(paymentData.amount),
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference,
      notes: paymentData.notes,
    };

    this.vendorPayments.unshift(newPayment);

    // If payment is linked to a specific purchase or general payment
    if (paymentData.purchaseId) {
      const purchase = this.purchases.find(p => p.id === paymentData.purchaseId);
      if (purchase) {
        if (!purchase.paymentHistory) purchase.paymentHistory = [];
        purchase.paymentHistory.unshift({
          id: newPayment.id,
          date: newPayment.date,
          amount: newPayment.amount,
          paymentMethod: newPayment.paymentMethod,
          reference: newPayment.reference,
          notes: newPayment.notes,
        });

        purchase.paidAmount = Math.min(purchase.totalAmount, purchase.paidAmount + newPayment.amount);
        purchase.dueAmount = Math.max(0, purchase.totalAmount - purchase.paidAmount);
        if (purchase.dueAmount === 0) {
          purchase.paymentStatus = 'PAID';
        } else if (purchase.paidAmount > 0) {
          purchase.paymentStatus = 'PARTIAL';
        }
      }
    } else {
      // Apply payment to oldest unpaid purchases for vendor
      let remainingPayment = newPayment.amount;
      const unpaidPurchases = this.purchases
        .filter(p => p.vendorId === paymentData.vendorId && p.dueAmount > 0 && p.status === 'Submitted')
        .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

      for (const p of unpaidPurchases) {
        if (remainingPayment <= 0) break;
        const payForThis = Math.min(p.dueAmount, remainingPayment);
        p.paidAmount += payForThis;
        p.dueAmount -= payForThis;
        remainingPayment -= payForThis;

        if (!p.paymentHistory) p.paymentHistory = [];
        p.paymentHistory.unshift({
          id: newPayment.id,
          date: newPayment.date,
          amount: payForThis,
          paymentMethod: newPayment.paymentMethod,
          reference: newPayment.reference,
          notes: newPayment.notes || 'General vendor payment applied',
        });

        if (p.dueAmount === 0) {
          p.paymentStatus = 'PAID';
        } else if (p.paidAmount > 0) {
          p.paymentStatus = 'PARTIAL';
        }
      }
    }

    this.logActivity('system', `Made ₹${newPayment.amount.toLocaleString('en-IN')} payment to ${vendor.firmName} (${newPayment.paymentMethod})`);
    return newPayment;
  }

  // Other Expenses Operations
  getOtherExpenses() {
    return [...this.otherExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  createOtherExpense(expenseData: Omit<OtherExpense, 'id'>) {
    const id = `exp-${Math.floor(100 + Math.random() * 900)}`;
    const newExpense: OtherExpense = {
      ...expenseData,
      id,
      amount: Number(expenseData.amount),
      date: expenseData.date || new Date().toISOString(),
    };

    this.otherExpenses.unshift(newExpense);
    this.logActivity('system', `Added ${newExpense.category} expense of ₹${newExpense.amount.toLocaleString('en-IN')}`);
    return newExpense;
  }

  updateOtherExpense(id: string, expenseData: Partial<OtherExpense>) {
    const index = this.otherExpenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Expense record not found.');

    this.otherExpenses[index] = {
      ...this.otherExpenses[index],
      ...expenseData,
      amount: expenseData.amount ? Number(expenseData.amount) : this.otherExpenses[index].amount,
    };
    return this.otherExpenses[index];
  }

  deleteOtherExpense(id: string) {
    const index = this.otherExpenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Expense record not found.');

    const deleted = this.otherExpenses[index];
    this.otherExpenses.splice(index, 1);
    this.logActivity('system', `Deleted ${deleted.category} expense record of ₹${deleted.amount.toLocaleString('en-IN')}`);
    return true;
  }

  // Helper activity log
  private logActivity(type: 'purchase' | 'issue' | 'waste' | 'system', description: string, referenceId?: string) {
    this.activities.unshift({
      id: `act-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      actor: 'Store Manager',
      description,
      referenceId,
    });

    if (this.activities.length > 50) {
      this.activities.pop();
    }
  }
}

export const db = new InMemoryDb();
export const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

