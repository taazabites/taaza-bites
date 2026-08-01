import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Coupon, Offer } from '../types';
import { auditService } from './audit';

// Toggle for UI Stabilization phase

// Local state for mock data

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Coupons/Offers Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const couponService = {
  /**
   * Subscribe to coupons collection in real-time
   */
  subscribeToCoupons(callback: (coupons: Coupon[]) => void): () => void {
    const path = 'coupons';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const coupons: Coupon[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        coupons.push({
          id: doc.id,
          couponId: data.couponId || doc.id,
          title: data.title || '',
          couponCode: data.couponCode || data.code || '',
          description: data.description || '',
          discountType: data.discountType || 'Percentage',
          discountValue: Number(data.discountValue ?? data.discount ?? 0),
          maximumDiscount: Number(data.maximumDiscount ?? 0),
          minimumOrder: Number(data.minimumOrder ?? data.minOrder ?? 0),
          validFrom: data.validFrom || '',
          validUntil: data.validUntil || data.expiryDate || '',
          maximumUsage: Number(data.maximumUsage ?? data.usageLimit ?? 0),
          usedCount: Number(data.usedCount ?? 0),
          usagePerCustomer: Number(data.usagePerCustomer ?? 1),
          applicablePlans: Array.isArray(data.applicablePlans) ? data.applicablePlans : [],
          applicableAreas: Array.isArray(data.applicableAreas) ? data.applicableAreas : [],
          applicableCategories: Array.isArray(data.applicableCategories) ? data.applicableCategories : [],
          applicableCustomers: Array.isArray(data.applicableCustomers) ? data.applicableCustomers : [],
          subscriptionOnly: !!data.subscriptionOnly,
          firstOrderOnly: !!data.firstOrderOnly,
          autoApply: !!data.autoApply,
          status: data.status || 'Active',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as Coupon);
      });
      callback(coupons);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  /**
   * Add a new coupon
   */
  async createCoupon(
    coupon: Omit<Coupon, 'id' | 'couponId' | 'createdAt' | 'updatedAt' | 'usedCount'>,
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const path = 'coupons';
    const now = new Date().toISOString();
    const colRef = collection(db, path);
    const docRef = doc(colRef);
    
    const newCoupon: Omit<Coupon, 'id'> = {
      ...coupon,
      couponId: docRef.id,
      usedCount: 0,
      createdAt: now,
      updatedAt: now
    };

    try {
      
      await setDoc(docRef, newCoupon);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${docRef.id}`);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'CREATE',
      `Coupon ${newCoupon.couponCode}`,
      `Created coupon ${newCoupon.couponCode} (${newCoupon.title}) of discount value ${newCoupon.discountValue}`
    );

    return docRef.id;
  },

  /**
   * Update coupon details
   */
  async updateCoupon(
    id: string,
    updates: Partial<Coupon>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const path = `coupons/${id}`;
    const now = new Date().toISOString();
    const docRef = doc(db, 'coupons', id);
    
    const updateData = {
      ...updates,
      updatedAt: now
    };

    try {
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'UPDATE',
      `Coupon ${updates.couponCode || id}`,
      `Updated properties of coupon code ${updates.couponCode || id}`
    );
  },

  /**
   * Delete a coupon
   */
  async deleteCoupon(id: string, adminId: string, adminEmail: string): Promise<void> {
    const path = `coupons/${id}`;
    const docRef = doc(db, 'coupons', id);
    
    try {
      
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'DELETE',
      `Coupon ${id}`,
      `Deleted coupon with ID ${id}`
    );
  },

  /**
   * Subscribe to offers/banners collection in real-time
   */
  subscribeToOffers(callback: (offers: Offer[]) => void): () => void {
    
    const path = 'offers';
    const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const offers: Offer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          offerId: data.offerId || doc.id,
          title: data.title || '',
          description: data.description || '',
          bannerImage: data.bannerImage || '',
          redirectUrl: data.redirectUrl || '',
          ctaText: data.ctaText || '',
          offerType: data.offerType || 'Promotion',
          applicableAreas: Array.isArray(data.applicableAreas) ? data.applicableAreas : [],
          displayOrder: Number(data.displayOrder ?? 0),
          status: data.status || 'Active',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as Offer);
      });
      callback(offers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  /**
   * Create an offer/banner
   */
  async createOffer(
    offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const path = 'offers';
    const now = new Date().toISOString();
    const colRef = collection(db, path);
    const docRef = doc(colRef);
    
    const newOffer: Omit<Offer, 'id'> = {
      ...offer,
      offerId: docRef.id,
      createdAt: now,
      updatedAt: now
    };

    try {
      
      await setDoc(docRef, newOffer);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${docRef.id}`);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'CREATE',
      `Offer ${newOffer.title}`,
      `Created CMS banner offer titled: "${newOffer.title}" linked to URL: ${newOffer.redirectUrl}`
    );

    return docRef.id;
  },

  /**
   * Update an offer/banner
   */
  async updateOffer(
    id: string,
    updates: Partial<Offer>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const path = `offers/${id}`;
    const now = new Date().toISOString();
    const docRef = doc(db, 'offers', id);
    
    const updateData = {
      ...updates,
      updatedAt: now
    };

    try {
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'UPDATE',
      `Offer ${updates.title || id}`,
      `Updated properties of promo banner "${updates.title || id}"`
    );
  },

  /**
   * Delete an offer/banner
   */
  async deleteOffer(id: string, adminId: string, adminEmail: string): Promise<void> {
    const path = `offers/${id}`;
    const docRef = doc(db, 'offers', id);
    
    try {
      
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'DELETE',
      `Offer ${id}`,
      `Deleted promotional banner offer with ID ${id}`
    );
  },

  /**
   * Seed default Coupons & Offers to prevent blank screens
   */
  async seedCouponsAndOffers(): Promise<void> {
    const now = new Date().toISOString();
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // 1. Seed Coupons
      const couponsSnap = await getDocs(collection(db, 'coupons'));
      if (couponsSnap.empty) {
        const initialCoupons = [
          {
            title: 'Welcome First Subscription Offer',
            couponCode: 'TAAZA20',
            description: 'Flat 20% Off on subscription plan. Valid for first subscription order only.',
            discountType: 'Percentage' as const,
            discountValue: 20,
            maximumDiscount: 250,
            minimumOrder: 499,
            validFrom: now.split('T')[0],
            validUntil: nextYear,
            maximumUsage: 500,
            usedCount: 142,
            usagePerCustomer: 1,
            applicablePlans: ['Powai Premium Route', 'Bandra West Coastal', 'Standard Plan', 'Premium Plan'],
            applicableAreas: ['400076', '400072', '400050', '400049'],
            subscriptionOnly: true,
            firstOrderOnly: true,
            autoApply: false,
            status: 'Active' as const
          },
          {
            title: 'Monsoon Flat Discount Code',
            couponCode: 'RAINY150',
            description: 'Get Flat ₹150 off on orders of ₹799 or more across Mumbai.',
            discountType: 'Flat Amount' as const,
            discountValue: 150,
            maximumDiscount: 150,
            minimumOrder: 799,
            validFrom: now.split('T')[0],
            validUntil: nextYear,
            maximumUsage: 1000,
            usedCount: 235,
            usagePerCustomer: 2,
            applicablePlans: [],
            applicableAreas: [],
            subscriptionOnly: false,
            firstOrderOnly: false,
            autoApply: false,
            status: 'Active' as const
          },
          {
            title: 'Fit & Healthy Flash Promo',
            couponCode: 'HEALTHY50',
            description: 'Flat 50% discount up to ₹100 for nutrition-rich subscriptions.',
            discountType: 'Percentage' as const,
            discountValue: 50,
            maximumDiscount: 100,
            minimumOrder: 250,
            validFrom: now.split('T')[0],
            validUntil: nextYear,
            maximumUsage: 300,
            usedCount: 84,
            usagePerCustomer: 1,
            applicablePlans: [],
            applicableAreas: [],
            subscriptionOnly: true,
            firstOrderOnly: false,
            autoApply: true,
            status: 'Active' as const
          },
          {
            title: 'Powai Premium Free Delivery',
            couponCode: 'POWAIEXPRESS',
            description: 'Flat ₹50 Delivery Fee waive-off coupon for Powai Lake premium zones.',
            discountType: 'Flat Amount' as const,
            discountValue: 50,
            maximumDiscount: 50,
            minimumOrder: 300,
            validFrom: now.split('T')[0],
            validUntil: nextYear,
            maximumUsage: 200,
            usedCount: 18,
            usagePerCustomer: 3,
            applicablePlans: [],
            applicableAreas: ['400076'],
            subscriptionOnly: false,
            firstOrderOnly: false,
            autoApply: false,
            status: 'Inactive' as const
          }
        ];

        const batch = writeBatch(db);
        for (const coupon of initialCoupons) {
          const docRef = doc(collection(db, 'coupons'));
          batch.set(docRef, {
            couponId: docRef.id,
            ...coupon,
            createdAt: now,
            updatedAt: now
          });
        }
        await batch.commit();
        console.log('Seeded initial advanced coupons successfully.');
      }

      // 2. Seed Offers/Banners
      const offersSnap = await getDocs(collection(db, 'offers'));
      if (offersSnap.empty) {
        const initialOffers = [
          {
            title: 'Vibrant Salad Collection Launch',
            description: 'Handcrafted fresh, leafy greens sourced from organic farms straight to your table. Flat ₹100 discount!',
            bannerImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200',
            redirectUrl: '/meals',
            ctaText: 'Order Salads',
            offerType: 'Promotion' as const,
            applicableAreas: [],
            displayOrder: 1,
            status: 'Active' as const,
            startDate: now.split('T')[0],
            endDate: nextYear
          },
          {
            title: 'Chef-Crafted Keto Meal Plans',
            description: 'Low-carb nutrition customized for weight loss and ultimate focus. Start your 30-day journey today.',
            bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200',
            redirectUrl: '/plans',
            ctaText: 'View Keto Plans',
            offerType: 'Promotion' as const,
            applicableAreas: [],
            displayOrder: 2,
            status: 'Active' as const,
            startDate: now.split('T')[0],
            endDate: nextYear
          },
          {
            title: 'Monsoon Wellness Subscription Booster',
            description: 'Unlock priority daily doorstep delivery and 100% immune-boosting organic meals.',
            bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
            redirectUrl: '/plans',
            ctaText: 'Subscribe Now',
            offerType: 'Promotion' as const,
            applicableAreas: [],
            displayOrder: 3,
            status: 'Inactive' as const,
            startDate: now.split('T')[0],
            endDate: nextYear
          }
        ];

        const batch = writeBatch(db);
        for (const offer of initialOffers) {
          const docRef = doc(collection(db, 'offers'));
          batch.set(docRef, {
            offerId: docRef.id,
            ...offer,
            createdAt: now,
            updatedAt: now
          });
        }
        await batch.commit();
        console.log('Seeded initial promotional banners successfully.');
      }
    } catch (error) {
      console.error('Error seeding coupons/offers initial data:', error);
    }
  }
};
