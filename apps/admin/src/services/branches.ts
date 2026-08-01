import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { systemMonitoringService } from './system-monitoring';

export interface Branch {
  id: string;
  name: string;
  code: string;
  kitchenName: string;
  gstNumber: string;
  fssaiNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  openingHours: string;
  closingHours: string;
  deliveryRadius: number;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  timezone: string;
  managerId?: string;
  createdAt: any;
  todaysOrders?: number;
  todaysRevenue?: number;
}

export interface BranchManager {
  id: string;
  branchId: string;
  userId: string;
  name: string;
  role: string;
  permissions: string[];
}

export const branchService = {
  async getBranches() {
    try {
      const q = query(collection(db, 'branches'));
      const snapshot = await getDocs(q);
      const branches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
      return branches;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  async addBranch(branchData: Omit<Branch, 'id' | 'createdAt'>, adminId: string, adminName: string) {
    try {
      const docRef = await addDoc(collection(db, 'branches'), {
        ...branchData,
        createdAt: serverTimestamp(),
        todaysOrders: 0,
        todaysRevenue: 0
      });
      
      await systemMonitoringService.logAction({
        adminId,
        adminName,
        role: 'Admin',
        module: 'Branches',
        action: 'Create Branch',
        recordId: docRef.id,
        status: 'Success'
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding branch:', error);
      throw error;
    }
  },

  async updateBranch(branchId: string, updates: Partial<Branch>, adminId: string, adminName: string) {
    try {
      const docRef = doc(db, 'branches', branchId);
      await updateDoc(docRef, updates);
      
      await systemMonitoringService.logAction({
        adminId,
        adminName,
        role: 'Admin',
        module: 'Branches',
        action: 'Update Branch',
        recordId: branchId,
        status: 'Success'
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  },

  async assignManager(branchId: string, managerData: Omit<BranchManager, 'id' | 'branchId'>) {
    try {
      const batch = writeBatch(db);
      
      const managerRef = doc(collection(db, 'branchManagers'));
      batch.set(managerRef, {
        ...managerData,
        branchId,
        createdAt: serverTimestamp()
      });
      
      const branchRef = doc(db, 'branches', branchId);
      batch.update(branchRef, { managerId: managerRef.id });
      
      await batch.commit();
      return managerRef.id;
    } catch (error) {
      console.error('Error assigning manager:', error);
      throw error;
    }
  },
  
  async getDashboardMetrics() {
    try {
      const branches = await this.getBranches();
      
      const activeBranches = branches.filter(b => b.status === 'Active').length;
      const totalKitchens = branches.length; // Assuming 1 kitchen per branch for now
      const todaysOrders = branches.reduce((sum, b) => sum + (b.todaysOrders || 0), 0);
      const todaysRevenue = branches.reduce((sum, b) => sum + (b.todaysRevenue || 0), 0);
      
      // We would normally fetch active staff from a users/staff collection scoped by branch
      const activeStaff = 0; 
      
      return {
        totalBranches: branches.length,
        activeBranches,
        totalKitchens,
        todaysOrders,
        todaysRevenue,
        activeStaff
      };
    } catch (error) {
      console.error('Error fetching branch metrics:', error);
      throw error;
    }
  }
};
