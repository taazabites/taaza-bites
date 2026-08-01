import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  writeBatch,
  increment,
  getDoc,
  getDocs,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ingredient, StockMovement, PurchaseOrder, Supplier } from '../types';

export const inventoryService = {
  subscribeIngredients(callback: (items: Ingredient[]) => void) {
    return onSnapshot(query(collection(db, 'ingredients'), orderBy('name', 'asc')), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ingredient));
      callback(list);
    });
  },

  subscribeSuppliers(callback: (items: Supplier[]) => void) {
    return onSnapshot(collection(db, 'suppliers'), (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          name: data.name || data.companyName || "",
          companyName: data.companyName || data.name || "",
          ...data 
        } as Supplier;
      });
      // Sort client-side to ensure robust sorting without needing complex Firestore indexes
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      callback(list);
    });
  },

  subscribePurchaseOrders(callback: (items: PurchaseOrder[]) => void) {
    return onSnapshot(query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc')), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseOrder));
      callback(list);
    });
  },

  subscribeStockMovements(callback: (items: StockMovement[]) => void) {
    return onSnapshot(query(collection(db, 'stockMovements'), orderBy('createdAt', 'desc')), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as StockMovement));
      callback(list);
    });
  },

  async createIngredient(data: any, userEmail: string): Promise<string> {
    const now = new Date().toISOString();
    const newIngredient = { 
      ...data, 
      stock: Number(data.stock || 0),
      minStock: Number(data.minStock || 0),
      maxStock: Number(data.maxStock || 0),
      currentStock: Number(data.stock || 0),
      createdAt: now, 
      updatedAt: now 
    };
    const docRef = await addDoc(collection(db, 'ingredients'), newIngredient);
    return docRef.id;
  },

  async updateIngredient(id: string, data: any, userEmail: string): Promise<void> {
    const stock = Number(data.stock || 0);
    await updateDoc(doc(db, 'ingredients', id), { 
      ...data, 
      stock,
      currentStock: stock,
      updatedAt: new Date().toISOString() 
    });
  },

  async deleteIngredient(id: string): Promise<void> {
    await deleteDoc(doc(db, 'ingredients', id));
  },

  async logStockMovement(movement: any): Promise<void> {
    const now = new Date().toISOString();
    const batch = writeBatch(db);

    // 1. Add movement log
    const movementRef = doc(collection(db, 'stockMovements'));
    batch.set(movementRef, { ...movement, createdAt: now });

    // 2. Adjust target ingredient stock level in real-time
    if (movement.ingredientId) {
      const ingRef = doc(db, 'ingredients', movement.ingredientId);
      const qty = Number(movement.quantity);
      let diff = 0;
      if (movement.type === 'Stock In' || movement.movementType === 'Purchase') {
        diff = qty;
      } else if (movement.type === 'Stock Out' || movement.type === 'Wastage' || movement.movementType === 'Consumption' || movement.movementType === 'Waste') {
        diff = -qty;
      }

      if (movement.type === 'Adjustment') {
        // Set exact stock
        batch.update(ingRef, { 
          stock: qty, 
          currentStock: qty,
          updatedAt: now 
        });
      } else {
        // Increment/Decrement relative
        // We use client-side or Firestore atomic increment. Since we want immediate exact balance, we'll increment
        const incrementValue = diff;
        // Fetch current or rely on database transaction/batch update. Since we are in a simple client app, we can use firestore's native increment or batch.
        // We'll update the stock field
        batch.update(ingRef, {
          stock: increment(incrementValue),
          currentStock: increment(incrementValue),
          updatedAt: now
        });
      }
    }

    await batch.commit();
  },

  async createPurchaseOrder(data: any): Promise<string> {
    const now = new Date().toISOString();
    const poNumber = data.poNumber || `PO-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalCost = data.items?.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.costPerUnit || 0)), 0) || 0;
    
    const newPO = { 
      ...data, 
      poNumber,
      totalCost,
      status: data.status || "Draft",
      createdAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(collection(db, 'purchaseOrders'), newPO);
    return docRef.id;
  },

  async updatePOStatus(id: string, status: PurchaseOrder['status'], userEmail: string): Promise<void> {
    const now = new Date().toISOString();
    const updateData: any = { 
      status, 
      updatedAt: now 
    };

    if (status === 'Approved') {
      updateData.approvedBy = userEmail;
    } else if (status === 'Received') {
      updateData.receivedBy = userEmail;
      
      // Auto update stocks when PO is marked as received!
      // First fetch the PO to get items
      const poSnap = await getDoc(doc(db, 'purchaseOrders', id));
      if (poSnap.exists()) {
        const poData = poSnap.data();
        const items = poData.items || [];
        const batch = writeBatch(db);

        for (const item of items) {
          // Find matching ingredient by name
          const q = query(collection(db, 'ingredients'), where('name', '==', item.ingredientName), limit(1));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const ingDoc = querySnap.docs[0];
            const addedQty = Number(item.quantity);
            // Update ingredient stock
            batch.update(ingDoc.ref, {
              stock: increment(addedQty),
              currentStock: increment(addedQty),
              updatedAt: now
            });

            // Log stock movement
            const movRef = doc(collection(db, 'stockMovements'));
            batch.set(movRef, {
              ingredientId: ingDoc.id,
              ingredientName: item.ingredientName,
              type: 'Stock In',
              movementType: 'Purchase',
              quantity: addedQty,
              reason: `Fulfillment of ${poData.poNumber || 'PO'}`,
              referenceType: 'PurchaseOrder',
              referenceId: id,
              performedBy: userEmail,
              createdAt: now
            });
          }
        }
        await batch.commit();
      }
    }

    await updateDoc(doc(db, 'purchaseOrders', id), updateData);
  },

  async createSupplier(data: any): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'suppliers'), { ...data, createdAt: now, updatedAt: now });
    return docRef.id;
  },
  
  async deleteSupplier(id: string): Promise<void> {
    await deleteDoc(doc(db, 'suppliers', id));
  },

  async updateSupplier(id: string, data: any): Promise<void> {
    await updateDoc(doc(db, 'suppliers', id), { ...data, updatedAt: new Date().toISOString() });
  },

  async seedStarterPack(userEmail: string): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // 1. Initial Suppliers
    const suppliersData = [
      {
        name: "Fresh Farms Co",
        companyName: "Fresh Farms Co",
        contactPerson: "Meera Nair",
        phone: "9876543210",
        email: "sales@freshfarms.in",
        gstNumber: "29AAAAA1111A1Z1",
        address: "G-Block APMC Market, Bengaluru",
        paymentTerms: "Net 30",
        status: "Active",
        productsSupplied: ["Vegetables", "Fruits", "Eggs"],
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Dairy Delight Distributors",
        companyName: "Dairy Delight Distributors",
        contactPerson: "Rajesh Kumar",
        phone: "9123456789",
        email: "orders@dairydelight.in",
        gstNumber: "29BBBBB2222B2Z2",
        address: "Koramangala Industrial Layout, Bengaluru",
        paymentTerms: "Net 15",
        status: "Active",
        productsSupplied: ["Paneer", "Beverages", "Sauces"],
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Taaza Grain Wholesalers",
        companyName: "Taaza Grain Wholesalers",
        contactPerson: "Amit Shah",
        phone: "9898989898",
        email: "bulk@taazagrains.com",
        gstNumber: "29CCCCC3333C3Z3",
        address: "Yeshwanthpur Grain Market, Bengaluru",
        paymentTerms: "Cash on Delivery",
        status: "Active",
        productsSupplied: ["Rice", "Millets", "Spices"],
        createdAt: now,
        updatedAt: now
      }
    ];

    const supplierRefs: string[] = [];
    for (const sup of suppliersData) {
      const ref = doc(collection(db, 'suppliers'));
      batch.set(ref, sup);
      supplierRefs.push(sup.name);
    }

    // 2. Initial Ingredients
    const ingredientsData = [
      {
        name: "Chicken Breast",
        category: "Chicken",
        stock: 12, // Low stock to trigger alert
        currentStock: 12,
        minStock: 30,
        maxStock: 150,
        unit: "kg",
        costPerUnit: 240,
        gstPercent: 5,
        supplierName: "Fresh Farms Co",
        storageLocation: "Freezer Unit A",
        expiryDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Chicken Mince",
        category: "Chicken",
        stock: 35,
        currentStock: 35,
        minStock: 20,
        maxStock: 100,
        unit: "kg",
        costPerUnit: 220,
        gstPercent: 5,
        supplierName: "Fresh Farms Co",
        storageLocation: "Freezer Unit B",
        expiryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Organic Tofu",
        category: "Others",
        stock: 25,
        currentStock: 25,
        minStock: 15,
        maxStock: 80,
        unit: "kg",
        costPerUnit: 160,
        gstPercent: 5,
        supplierName: "Dairy Delight Distributors",
        storageLocation: "Cold Room B",
        expiryDate: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Soya Chunks",
        category: "Others",
        stock: 40,
        currentStock: 40,
        minStock: 10,
        maxStock: 60,
        unit: "kg",
        costPerUnit: 110,
        gstPercent: 5,
        supplierName: "Taaza Grain Wholesalers",
        storageLocation: "Dry Pantry Shelf A",
        expiryDate: new Date(Date.now() + 150 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Premium Basmati Rice",
        category: "Rice",
        stock: 120,
        currentStock: 120,
        minStock: 50,
        maxStock: 300,
        unit: "kg",
        costPerUnit: 90,
        gstPercent: 5,
        supplierName: "Taaza Grain Wholesalers",
        storageLocation: "Main Warehouse Shelf C",
        expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Organic Quinoa",
        category: "Millets",
        stock: 45,
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        unit: "kg",
        costPerUnit: 180,
        gstPercent: 5,
        supplierName: "Taaza Grain Wholesalers",
        storageLocation: "Main Warehouse Shelf D",
        expiryDate: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Organic Oats",
        category: "Millets",
        stock: 8, // Low stock
        currentStock: 8,
        minStock: 15,
        maxStock: 75,
        unit: "kg",
        costPerUnit: 130,
        gstPercent: 5,
        supplierName: "Taaza Grain Wholesalers",
        storageLocation: "Main Warehouse Shelf E",
        expiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Organic Baby Spinach",
        category: "Vegetables",
        stock: 8, // Low stock to trigger alert
        currentStock: 8,
        minStock: 15,
        maxStock: 50,
        unit: "kg",
        costPerUnit: 120,
        gstPercent: 5,
        supplierName: "Fresh Farms Co",
        storageLocation: "Cold Room A",
        expiryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Fresh Paneer",
        category: "Paneer",
        stock: 5, // Low stock
        currentStock: 5,
        minStock: 10,
        maxStock: 30,
        unit: "kg",
        costPerUnit: 350,
        gstPercent: 5,
        supplierName: "Dairy Delight Distributors",
        storageLocation: "Cold Room B",
        expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Country Eggs",
        category: "Eggs",
        stock: 50, // Low stock
        currentStock: 50,
        minStock: 150,
        maxStock: 500,
        unit: "pcs",
        costPerUnit: 6,
        gstPercent: 5,
        supplierName: "Fresh Farms Co",
        storageLocation: "Room Temp Pantry 2",
        expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Cold Pressed Olive Oil",
        category: "Others",
        stock: 12,
        currentStock: 12,
        minStock: 10,
        maxStock: 50,
        unit: "litres",
        costPerUnit: 650,
        gstPercent: 5,
        supplierName: "Dairy Delight Distributors",
        storageLocation: "Main Warehouse Shelf F",
        expiryDate: new Date(Date.now() + 300 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Mixed Spices Mix",
        category: "Spices",
        stock: 18,
        currentStock: 18,
        minStock: 5,
        maxStock: 25,
        unit: "kg",
        costPerUnit: 420,
        gstPercent: 5,
        supplierName: "Taaza Grain Wholesalers",
        storageLocation: "Dry Pantry Shelf B",
        expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Meal Boxes",
        category: "Packaging Material",
        stock: 1200,
        currentStock: 1200,
        minStock: 300,
        maxStock: 3000,
        unit: "pcs",
        costPerUnit: 4.5,
        gstPercent: 12,
        supplierName: "Dairy Delight Distributors",
        storageLocation: "Packaging Vault",
        expiryDate: "",
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Salad Bowls",
        category: "Packaging Material",
        stock: 80, // Low stock!
        currentStock: 80,
        minStock: 200,
        maxStock: 1500,
        unit: "pcs",
        costPerUnit: 5.2,
        gstPercent: 12,
        supplierName: "Dairy Delight Distributors",
        storageLocation: "Packaging Vault",
        expiryDate: "",
        status: "Active",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Spoons",
        category: "Packaging Material",
        stock: 1500,
        currentStock: 1500,
        minStock: 500,
        maxStock: 4000,
        unit: "pcs",
        costPerUnit: 1.2,
        gstPercent: 12,
        supplierName: "Dairy Delight Distributors",
        storageLocation: "Packaging Vault",
        expiryDate: "",
        status: "Active",
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const ing of ingredientsData) {
      const ref = doc(collection(db, 'ingredients'));
      batch.set(ref, ing);

      // Log initial movement
      const movRef = doc(collection(db, 'stockMovements'));
      batch.set(movRef, {
        ingredientId: ref.id,
        ingredientName: ing.name,
        type: 'Stock In',
        movementType: 'Adjustment',
        quantity: ing.stock,
        reason: 'ERP System Initial Seed Stock Balance',
        performedBy: userEmail,
        createdAt: now
      });
    }

    // 3. Draft Purchase Order
    const poRef = doc(collection(db, 'purchaseOrders'));
    batch.set(poRef, {
      poNumber: "PO-772918",
      supplierName: "Fresh Farms Co",
      status: "Draft",
      expectedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items: [
        { ingredientName: "Organic Baby Spinach", quantity: 42, unit: "kg", costPerUnit: 120 },
        { ingredientName: "Country Eggs", quantity: 450, unit: "pcs", costPerUnit: 6 }
      ],
      totalCost: (42 * 120) + (450 * 6),
      createdAt: now,
      updatedAt: now
    });

    await batch.commit();
  },

  async autoSuggestPOs(ingredients: Ingredient[]): Promise<number> {
    const lowStock = ingredients.filter(i => (i.stock || 0) <= (i.minStock || 0));
    if (lowStock.length === 0) return 0;

    // Group low-stock items by preferred supplier
    const grouped: Record<string, Ingredient[]> = {};
    for (const ing of lowStock) {
      const vendor = ing.supplierName || "Fresh Farms Co"; // Fallback to primary supplier
      if (!grouped[vendor]) {
        grouped[vendor] = [];
      }
      grouped[vendor].push(ing);
    }

    let poCount = 0;
    for (const [vendor, items] of Object.entries(grouped)) {
      const poItems = items.map(ing => {
        const fillQty = Math.max((ing.maxStock || 50) - (ing.stock || 0), 10);
        return {
          ingredientName: ing.name,
          quantity: fillQty,
          unit: ing.unit || "kg",
          costPerUnit: ing.costPerUnit || 100
        };
      });

      await this.createPurchaseOrder({
        supplierName: vendor,
        expectedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: "Draft",
        items: poItems
      });
      poCount++;
    }

    return poCount;
  }
};
