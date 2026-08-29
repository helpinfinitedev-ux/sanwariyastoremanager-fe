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
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  paymentTerms?: string;
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
  { id: 'v1', name: 'Metro Cash & Carry', code: 'VND-METRO', contactPerson: 'John Doe', phone: '+1 555-0199', email: 'orders@metro.com', address: '45 Wholesale Ave, Industrial Zone' },
  { id: 'v2', name: 'Fresh Fields Organics', code: 'VND-FIELDS', contactPerson: 'Sarah Jenkins', phone: '+1 555-0144', email: 'sales@freshfields.com', address: '12 Farmhouse Road, Countryside' },
  { id: 'v3', name: 'Apex Packaging Suppliers', code: 'VND-APEX', contactPerson: 'Robert Chen', phone: '+1 555-0211', email: 'accounts@apexpack.com', address: '99 Box Road, Logistics Park' },
  { id: 'v4', name: 'Premium Meat Co.', code: 'VND-PREMMEAT', contactPerson: 'Mark Miller', phone: '+1 555-0300', email: 'orders@premiummeat.com', address: '88 Butcher Street, Portside' },
  { id: 'v5', name: 'Deluxe Dairy Distributor', code: 'VND-DELUXED', contactPerson: 'Anna Smith', phone: '+1 555-0455', email: 'info@deluxedairy.com', address: '77 Milking Way, Creamery Valley' },
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
    // 1. Pre-seed Purchases
    const initialPurchases: Purchase[] = [
      {
        id: 'po-1001',
        invoiceNo: 'INV-2026-001',
        vendorId: 'v1',
        vendorName: 'Metro Cash & Carry',
        orderDate: '2026-08-01T10:00:00Z',
        deliveryDate: '2026-08-01T15:00:00Z',
        totalAmount: 187.0,
        status: 'Submitted',
        notes: 'Initial monthly seed pantry items',
        items: [
          { productId: 'p7', productName: 'All-Purpose Flour 25kg', quantity: 5, unitCost: 22.0, subtotal: 110.0 },
          { productId: 'p8', productName: 'White Sugar 10kg', quantity: 5, unitCost: 10.5, subtotal: 52.5 },
          { productId: 'p14', productName: 'Canola Frying Oil 5L', quantity: 2, unitCost: 12.2, subtotal: 24.5 },
        ],
      },
      {
        id: 'po-1002',
        invoiceNo: 'INV-2026-002',
        vendorId: 'v4',
        vendorName: 'Premium Meat Co.',
        orderDate: '2026-08-03T09:30:00Z',
        deliveryDate: '2026-08-03T14:00:00Z',
        totalAmount: 432.0,
        status: 'Submitted',
        items: [
          { productId: 'p5', productName: 'Chicken Breast 1kg', quantity: 40, unitCost: 5.5, subtotal: 220.0 },
          { productId: 'p6', productName: 'Beef Tenderloin 1kg', quantity: 15, unitCost: 14.13, subtotal: 212.0 },
        ],
      },
      {
        id: 'po-1003',
        invoiceNo: 'INV-2026-003',
        vendorId: 'v5',
        vendorName: 'Deluxe Dairy Distributor',
        orderDate: '2026-08-05T08:00:00Z',
        deliveryDate: '',
        totalAmount: 216.0,
        status: 'Draft',
        notes: 'Pending confirmation of butter prices',
        items: [
          { productId: 'p1', productName: 'Whole Milk 1L', quantity: 60, unitCost: 1.5, subtotal: 90.0 },
          { productId: 'p3', productName: 'Unsalted Butter 500g', quantity: 30, unitCost: 3.2, subtotal: 96.0 },
          { productId: 'p2', productName: 'Eggs Large (Tray of 30)', quantity: 6, unitCost: 5.0, subtotal: 30.0 },
        ],
      },
    ];

    this.purchases = initialPurchases;

    // Apply stock change for submitted purchases in seed
    initialPurchases.forEach(p => {
      if (p.status === 'Submitted') {
        p.items.forEach(item => {
          const prod = this.products.find(pr => pr.id === item.productId);
          // Just track movement record
          if (prod) {
            this.movements.push({
              id: `mvt-${Math.random().toString(36).substr(2, 9)}`,
              date: p.orderDate,
              type: 'Purchase',
              productId: item.productId,
              productName: prod.name,
              quantityChange: item.quantity,
              balanceAfter: prod.currentStock, // Seeded stock is final
              referenceId: p.id,
            });
          }
        });
        this.activities.push({
          id: `act-${p.id}`,
          timestamp: p.orderDate,
          type: 'purchase',
          actor: 'Store Manager',
          description: `Received purchase delivery from ${p.vendorName}. Invoice: ${p.invoiceNo}. Total: ₹${p.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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

  // 1. Purchase Operations
  createPurchase(purchaseData: Omit<Purchase, 'id' | 'vendorName' | 'totalAmount'>) {
    const id = `po-${Math.floor(1000 + Math.random() * 9000)}`;
    const vendor = this.vendors.find(v => v.id === purchaseData.vendorId);
    const vendorName = vendor ? vendor.name : 'Unknown Vendor';
    
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

    const newPurchase: Purchase = {
      ...purchaseData,
      id,
      vendorName,
      items,
      totalAmount,
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
    
    // We do not allow changing status of already submitted purchase to Draft
    if (original.status === 'Submitted' && updates.status === 'Draft') {
      throw new Error('Cannot revert a submitted purchase to draft status');
    }

    // Merge changes
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

    const merged: Purchase = {
      ...original,
      ...updates,
      items: updatedItems,
      totalAmount,
    };

    this.purchases[idx] = merged;

    // Check transition from Draft -> Submitted
    if (original.status === 'Draft' && merged.status === 'Submitted') {
      this.processSubmittedPurchase(merged);
    } else {
      this.logActivity('purchase', `Updated purchase order ${merged.invoiceNo}`, id);
    }

    return merged;
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

  createSupplier(vendorData: Omit<Vendor, 'id' | 'code'>) {
    const exists = this.vendors.some(v => v.name.trim().toLowerCase() === vendorData.name.trim().toLowerCase());
    if (exists) throw new Error('Supplier already exists.');

    const id = `v${this.vendors.length + 1}`;
    const code = `VND-${vendorData.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5)}`;
    
    const newVendor: Vendor = {
      ...vendorData,
      id,
      code,
      name: vendorData.name.trim(),
    };
    this.vendors.push(newVendor);
    this.logActivity('system', `Added new supplier vendor: ${newVendor.name}`);
    return newVendor;
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

    // Keep activities limit
    if (this.activities.length > 50) {
      this.activities.pop();
    }
  }
}

export const db = new InMemoryDb();
export const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
