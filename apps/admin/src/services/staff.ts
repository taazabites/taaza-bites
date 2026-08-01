import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  addDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auditService } from './audit';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

// Toggle for UI Stabilization phase

// Local state for mock data
let localStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Chef Sanjay",
    email: "sanjay@taazabites.com",
    phone: "+91 98765 00001",
    role: "Executive Chef",
    status: "Active",
    createdAt: new Date().toISOString()
  },
  {
    id: "staff-2",
    name: "Amit Patel",
    email: "amit@taazabites.com",
    phone: "+91 98765 00002",
    role: "Operations Manager",
    status: "Active",
    createdAt: new Date().toISOString()
  },
  {
    id: "staff-3",
    name: "Priya Singh",
    email: "priya@taazabites.com",
    phone: "+91 98765 00003",
    role: "Clinical Nutritionist",
    status: "Active",
    createdAt: new Date().toISOString()
  }
];

export const staffService = {
  subscribeToStaff(callback: (staff: StaffMember[]) => void): () => void {
    
    const q = query(collection(db, 'staff'), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember));
      callback(staff);
    });
  },

  async addStaff(staff: Omit<StaffMember, 'id' | 'createdAt'>, adminId: string, adminEmail: string): Promise<string> {
    const now = new Date().toISOString();
    

    try {
      const docRef = await addDoc(collection(db, 'staff'), {
        ...staff,
        createdAt: now
      });
      
      await auditService.logAction(
        adminId,
        adminEmail,
        'CREATE',
        `Staff ${staff.name}`,
        `Added new staff member: ${staff.name} with role ${staff.role}`
      );
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding staff:", error);
      throw error;
    }
  },

  async deleteStaff(id: string, adminId: string, adminEmail: string): Promise<void> {
    

    try {
      await deleteDoc(doc(db, 'staff', id));
      
      await auditService.logAction(
        adminId,
        adminEmail,
        'DELETE',
        `Staff ${id}`,
        `Removed staff member with ID ${id}`
      );
    } catch (error) {
      console.error("Error deleting staff:", error);
      throw error;
    }
  }
};
