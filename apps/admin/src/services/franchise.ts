import { collection, doc, getDocs, addDoc, updateDoc, query, where, serverTimestamp, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { systemMonitoringService } from './system-monitoring';

// Toggle for UI Stabilization phase

// Local state for mock data

export interface Franchise {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  fssaiNumber: string;
  address: string;
  city: string;
  state: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  securityDeposit: number;
  status: 'Pending' | 'Active' | 'Suspended' | 'Terminated';
  monthlyRevenue: number;
  assignedBranchId?: string;
  assignedBrandId?: string;
  createdAt: any;
}

export interface Brand {
  id: string;
  name: string; // e.g., Taaza Bites, Taaza Cafe
  logoUrl?: string;
  primaryColor?: string;
  status: 'Active' | 'Inactive';
}

export interface Settlement {
  id: string;
  franchiseId: string;
  period: string; // e.g., "YYYY-MM"
  totalRevenue: number;
  platformCommission: number; // percentage or fixed
  franchiseCommission: number;
  netPayout: number;
  status: 'Pending' | 'Processing' | 'Paid';
  paidAt?: any;
}

export const franchiseService = {
  subscribeToFranchises(callback: (franchises: Franchise[]) => void) {
    
    const q = query(collection(db, 'franchises'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Franchise));
      callback(data);
    }, (error) => {
      console.error('Error in franchise listener:', error);
    });
  },

  async getFranchises() {
    
    try {
      const q = query(collection(db, 'franchises'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Franchise));
    } catch (error) {
      console.error('Error fetching franchises:', error);
      throw error;
    }
  },

  async addFranchise(data: Omit<Franchise, 'id' | 'createdAt' | 'monthlyRevenue'>, adminId: string, adminName: string) {
    
    try {
      const docRef = await addDoc(collection(db, 'franchises'), {
        ...data,
        monthlyRevenue: 0,
        createdAt: serverTimestamp()
      });
      
      await systemMonitoringService.logAction({
        adminId,
        adminName,
        role: 'Admin',
        module: 'Franchises',
        action: 'Register Franchise',
        recordId: docRef.id,
        status: 'Success'
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding franchise:', error);
      throw error;
    }
  },

  async updateFranchiseStatus(id: string, status: Franchise['status'], adminId: string, adminName: string) {
    
    try {
      await updateDoc(doc(db, 'franchises', id), { status });
      await systemMonitoringService.logAction({
        adminId, adminName, role: 'Admin', module: 'Franchises', action: `Update Status -> ${status}`, recordId: id, status: 'Success'
      });
    } catch (error) {
      console.error('Error updating franchise status:', error);
      throw error;
    }
  },

  async getDashboardMetrics() {
    try {
      const franchises = await this.getFranchises();
      
      const totalFranchises = franchises.length;
      const activeFranchises = franchises.filter(f => f.status === 'Active').length;
      const pendingApplications = franchises.filter(f => f.status === 'Pending').length;
      const monthlyRevenue = franchises.reduce((sum, f) => sum + (f.monthlyRevenue || 0), 0);
      
      // Stubbed data for Customers & Orders across all franchises (in reality, query cross-collection)
      const totalCustomers = totalFranchises * 142; // placeholder logic
      const totalOrders = totalFranchises * 312; // placeholder logic
      
      return {
        totalFranchises,
        activeFranchises,
        pendingApplications,
        monthlyRevenue,
        totalCustomers,
        totalOrders
      };
    } catch (error) {
      console.error('Error fetching franchise metrics:', error);
      throw error;
    }
  }
};
