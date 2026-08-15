import { collection, getDocs, query, orderBy, limit, doc, updateDoc, onSnapshot, addDoc, deleteDoc, arrayUnion, getDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Customer, CustomerNote } from '../types';

// Toggle for UI Stabilization phase

// Local state for mock data to allow Add/Edit/Delete

export const customerService = {
  async addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const now = new Date().toISOString();
    const newCustomerData = {
      ...customer,
      createdAt: now,
      updatedAt: now,
      walletBalance: 0,
      rewardPoints: 0,
      status: customer.status || 'Active',
    };
    
    
    const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
    await updateDoc(docRef, { id: docRef.id });
    return { ...newCustomerData, id: docRef.id } as Customer;
  },
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    
    const customerRef = doc(db, 'customers', id);
    await updateDoc(customerRef, updates);
    return { id, ...updates } as Customer;
  },

  async deleteCustomer(id: string): Promise<void> {
    
    await deleteDoc(doc(db, 'customers', id));
  },

  
  async addCustomerAddress(customerId: string, address: any): Promise<void> {
    const addressId = `addr-${Math.random().toString(36).substring(7)}`;
    const newAddress = {
      ...address,
      id: addressId,
      customerId,
      addressLine1: address.addressLine1 || address.line1 || '',
      addressLine2: address.addressLine2 || address.line2 || '',
      line1: address.line1 || address.addressLine1 || '',
      line2: address.line2 || address.addressLine2 || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in root collection per prompt
    const docRef = await addDoc(collection(db, 'customerAddresses'), newAddress);
    await updateDoc(docRef, { id: docRef.id });
    // Also update the customer document
    await updateDoc(doc(db, 'customers', customerId), {
      addresses: arrayUnion({ ...newAddress, id: docRef.id })
    });
  },

  async updateCustomerAddress(customerId: string, addressId: string, updates: any): Promise<void> {
    const mappedUpdates = {
      ...updates,
      addressLine1: updates.addressLine1 || updates.line1,
      addressLine2: updates.addressLine2 || updates.line2,
      line1: updates.line1 || updates.addressLine1,
      line2: updates.line2 || updates.addressLine2,
      updatedAt: new Date().toISOString()
    };
    
    // Update in root collection 'customerAddresses'
    const addressRef = doc(db, 'customerAddresses', addressId);
    await updateDoc(addressRef, mappedUpdates);

    // Also update the customer doc's addresses array
    const customerRef = doc(db, 'customers', customerId);
    const snap = await getDoc(customerRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedAddresses = (data.addresses || []).map((addr: any) => 
        addr.id === addressId ? { ...addr, ...mappedUpdates } : addr
      );
      await updateDoc(customerRef, { addresses: updatedAddresses });
    }
  },

  async deleteCustomerAddress(customerId: string, addressId: string): Promise<void> {
    
    // Delete from root collection
    await deleteDoc(doc(db, 'customerAddresses', addressId));

    // Remove from customer doc's addresses array
    const customerRef = doc(db, 'customers', customerId);
    const snap = await getDoc(customerRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedAddresses = (data.addresses || []).filter((addr: any) => addr.id !== addressId);
      await updateDoc(customerRef, { addresses: updatedAddresses });
    }
  },



  async getCustomers(limitCount = 50): Promise<Customer[]> {
    
    try {
      const q = query(
        collection(db, 'customers'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  },
  subscribeCustomers(callback: (customers: Customer[]) => void): () => void {
    
    const q = query(
      collection(db, 'customers'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      callback(customers);
    }, (error) => {
      console.error("Error subscribing to customers:", error);
      callback([]);
    });
  },
  async updateCustomerStatus(customerId: string, status: 'Active' | 'Suspended'): Promise<void> {
    
    try {
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, { status });
    } catch (error) {
      console.error("Error updating customer status:", error);
      throw error;
    }
  },
  async adjustWalletBalance(customerId: string, amount: number, type: 'Wallet Credit' | 'Wallet Debit', method: string, adminEmail: string): Promise<void> {
    
    try {
      const customerRef = doc(db, 'customers', customerId);
      const snap = await getDoc(customerRef);
      if (!snap.exists()) throw new Error("Customer not found");
      const currentBalance = snap.data().walletBalance || 0;
      const nextBalance = type === 'Wallet Credit' ? currentBalance + amount : currentBalance - amount;
      if (nextBalance < 0) {
        throw new Error("Insufficient wallet balance for debit");
      }
      await updateDoc(customerRef, { walletBalance: nextBalance });
      const txnsRef = collection(db, 'transactions');
      await addDoc(txnsRef, {
        customerId,
        amount: type === 'Wallet Credit' ? amount : -amount,
        type,
        status: 'Success',
        method,
        timestamp: new Date().toISOString(),
        performedBy: adminEmail || 'System'
      });
    } catch (error) {
      console.error("Error adjusting wallet balance:", error);
      throw error;
    }
  },
  async adjustRewardPoints(customerId: string, amount: number, type: 'earn' | 'redeem', reason: string, adminEmail?: string): Promise<void> {
    
    try {
      const customerRef = doc(db, 'customers', customerId);
      const snap = await getDoc(customerRef);
      if (!snap.exists()) throw new Error("Customer not found");
      const currentPoints = snap.data().rewardPoints || 0;
      const delta = type === 'earn' ? amount : -amount;
      const nextPoints = currentPoints + delta;
      if (nextPoints < 0) throw new Error("Insufficient reward points");
      await updateDoc(customerRef, { rewardPoints: nextPoints });
      await addDoc(collection(db, 'reward_transactions'), {
        customerId,
        amount: delta,
        type,
        reason,
        timestamp: new Date().toISOString(),
        performedBy: adminEmail || 'System'
      });
    } catch (error) {
      console.error("Error adjusting reward points:", error);
      throw error;
    }
  },
  async updateCustomerHealth(customerId: string, health: any): Promise<void> {
    
    await updateDoc(doc(db, 'customers', customerId), {
      health: { ...health, lastUpdated: new Date().toISOString() }
    });
  },
  async addCustomerNote(customerId: string, content: string, authorId: string, authorName: string, priority: string = 'Normal', type: string = 'Admin Note'): Promise<void> {
    const noteId = `note-${Math.random().toString(36).substring(7)}`;
    const note = {
      id: noteId,
      customerId,
      content,
      authorId,
      authorName,
      priority,
      type,
      isPinned: false,
      attachments: [],
      createdAt: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'customerNotes'), note);
      await updateDoc(docRef, { id: docRef.id });
      // Keep small ref in customer for quick access
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, {
        notes: arrayUnion({ ...note, id: docRef.id })
      });
    } catch (error) {
      console.error("Error adding customer note:", error);
      throw error;
    }
  },
  
  async updateCustomerNote(customerId: string, noteId: string, updates: any): Promise<void> {
    
    try {
      const looksLikeId = noteId && !noteId.includes(' ') && noteId.length >= 10;
      if (looksLikeId) {
        try {
          await updateDoc(doc(db, 'customerNotes', noteId), updates);
        } catch (err) {
          console.warn("Could not update note in customerNotes collection:", err);
        }
      }
      
      const customerRef = doc(db, 'customers', customerId);
      const snap = await getDoc(customerRef);
      if (snap.exists()) {
        const customerData = snap.data();
        const updatedNotes = (customerData.notes || []).map((n: any) => 
          (n.id === noteId || n.content === noteId) ? { ...n, ...updates } : n
        );
        await updateDoc(customerRef, { notes: updatedNotes });
      }
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },
  async deleteCustomerNote(customerId: string, noteId: string): Promise<void> {
    
    try {
      const looksLikeId = noteId && !noteId.includes(' ') && noteId.length >= 10;
      if (looksLikeId) {
        try {
          await deleteDoc(doc(db, 'customerNotes', noteId));
        } catch (err) {
          console.warn("Could not delete note from customerNotes collection:", err);
        }
      }
      
      const customerRef = doc(db, 'customers', customerId);
      const snap = await getDoc(customerRef);
      if (snap.exists()) {
        const customerData = snap.data();
        const updatedNotes = (customerData.notes || []).filter((n: any) => 
          n.id !== noteId && n.content !== noteId
        );
        await updateDoc(customerRef, { notes: updatedNotes });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },
  subscribeCustomerNotes(callback: (notes: any[]) => void): () => void {
    
    const q = query(collection(db, 'customerNotes'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  },

  async getRewardTransactions(customerId: string): Promise<any[]> {
    
    try {
      const q = query(
        collection(db, 'reward_transactions'),
        where('customerId', '==', customerId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching reward transactions:", error);
      throw error;
    }
  },

  async getTransactionsByCustomerId(customerId: string): Promise<any[]> {
    
    try {
      const q = query(
        collection(db, 'transactions'),
        where('customerId', '==', customerId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  async getAllTransactions(): Promise<any[]> {
    
    try {
      const q = query(
        collection(db, 'transactions'),
        orderBy('timestamp', 'desc'),
        limit(150)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      // Fallback to empty list so page doesn't crash on empty collection
      return [];
    }
  },

  async getAllRewardTransactions(): Promise<any[]> {
    
    try {
      const q = query(
        collection(db, 'reward_transactions'),
        orderBy('timestamp', 'desc'),
        limit(150)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching all reward transactions:", error);
      // Fallback
      return [];
    }
  }
};
