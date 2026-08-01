import { collection, getDocs, doc, setDoc, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

let hasCheckedSeeded = false;

export const dbSeedService = {
  async ensureSeeded(force: boolean = false): Promise<void> {
    if (hasCheckedSeeded && !force) return;
    hasCheckedSeeded = true;
    try {
      let quotaExceeded = false;
      const checkAndSeed = async (colName: string, seedData: any[]) => {
        if (quotaExceeded) return;
        try {
          const snap = await getDocs(query(collection(db, colName), limit(1)));
          if (snap.empty || force) {
            console.log(`${force ? 'Force' : ''} Seeding ${colName}...`);
            for (const item of seedData) {
              const { id, ...data } = item;
              await setDoc(doc(db, colName, id), data);
            }
          }
        } catch (err: any) {
          const errStr = String(err?.message || err || '').toLowerCase();
          if (errStr.includes('resource-exhausted') || errStr.includes('quota limit exceeded')) {
            quotaExceeded = true;
            console.warn(`Firestore quota reached while checking/seeding ${colName}. Using default client data.`);
          } else {
            console.error(`Error checking/seeding ${colName}:`, err);
          }
        }
      };

      // 1. Seed Business Settings
      const settings = [
        {
          id: 'business_profile',
          companyName: 'TaazaBites',
          brandLogo: 'https://taazabites.in/logo.png',
          gstNumber: '23AAAAA0000A1Z5',
          pan: 'AAAAA0000A',
          fssaiLicense: '11421850000000',
          businessAddress: '123 Health Avenue, Indore, MP 452001',
          supportEmail: 'support@taazabites.in',
          supportPhone: '+91 88888 99999',
          website: 'https://taazabites.in',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          taxSettings: {
            foodGst: 5,
            deliveryGst: 18,
            packagingGst: 18
          },
          invoicePrefix: 'TB-INV-',
          orderPrefix: 'TB-ORD-',
          customerPrefix: 'TB-CUST-',
          cancellationPolicy: 'Cancellations allowed up to 12 hours before delivery.',
          refundPolicy: 'Refunds processed within 5-7 business days.',
          operatingHours: '07:00 AM - 10:00 PM',
          updatedAt: new Date().toISOString()
        }
      ];
      await checkAndSeed('settings', settings);

      // 2. Seed Branches (Production Branches)
      const branches = [
        {
          id: 'branch_indore_central',
          branchName: 'Indore Central',
          kitchenName: 'Central Cloud Kitchen',
          address: '123 Health Avenue, Indore, MP 452001',
          googleMapsUrl: 'https://maps.google.com/?q=22.719568,75.857725',
          operatingHours: '07:00 AM - 10:00 PM',
          kitchenManager: 'Manager 1',
          deliveryRadiusKm: 15,
          deliverySlots: ['Morning (7 AM - 10 AM)', 'Lunch (12 PM - 3 PM)', 'Dinner (7 PM - 10 PM)'],
          status: 'Active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'branch_indore_east',
          branchName: 'Indore East',
          kitchenName: 'East Cloud Kitchen',
          address: '456 Tech Park, Vijay Nagar, Indore, MP 452010',
          googleMapsUrl: 'https://maps.google.com/?q=22.7533,75.8937',
          operatingHours: '07:00 AM - 10:00 PM',
          kitchenManager: 'Manager 2',
          deliveryRadiusKm: 10,
          deliverySlots: ['Morning (7 AM - 10 AM)', 'Lunch (12 PM - 3 PM)', 'Dinner (7 PM - 10 PM)'],
          status: 'Active',
          createdAt: new Date().toISOString()
        }
      ];
      await checkAndSeed('branches', branches);

      // 3. Seed Admins (Keep Main Admin)
      const admins = [
        {
          id: 'Ja3Wy4EaIMeUVPWcy1fI8JkRqzz1',
          email: 'admin@taazabites.in',
          role: 'Super Admin',
          name: 'Main Admin',
          status: 'Active'
        }
      ];
      await checkAndSeed('admins', admins);

      // 4. Seed Subscription Plans
      const subscriptionPlans = [
        {
          id: 'plan_3day_trial',
          name: '3 Day Trial',
          shortDescription: 'Taste the health',
          description: 'A 3-day trial plan to experience our healthy meals.',
          price: 999,
          offerPrice: 799,
          duration: 3,
          mealsPerDay: 2,
          calories: 1500,
          protein: 80,
          carbs: 120,
          fat: 50,
          goal: 'Maintenance',
          features: ['2 Meals a day', 'Free Delivery', 'Standard Support'],
          deliverySchedule: 'Daily',
          status: 'Active',
          displayOrder: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'plan_weekly',
          name: 'Weekly Health',
          shortDescription: '7 days of balanced nutrition',
          description: 'Perfect for a week of healthy eating without the hassle.',
          price: 2499,
          offerPrice: 2199,
          duration: 7,
          mealsPerDay: 2,
          calories: 1500,
          protein: 85,
          carbs: 110,
          fat: 45,
          goal: 'Weight Loss',
          features: ['Nutritionist Consult', 'Flexible Menu', 'Free Delivery'],
          deliverySchedule: 'Mon-Sun',
          status: 'Active',
          displayOrder: 2,
          createdAt: new Date().toISOString()
        }
      ];
      await checkAndSeed('subscriptionPlans', subscriptionPlans);

      // 5. Seed menuItems
      const menuItems = [
        {
          id: 'menu_protein_bowl',
          mealName: 'High Protein Quinoa Bowl',
          shortDescription: 'Quinoa with grilled tofu & veggies',
          description: 'A superfood bowl packed with quinoa, grilled tofu, broccoli, and a light lemon tahini dressing.',
          category: 'Protein Bowls',
          dietType: 'Vegan',
          mealType: 'Veg',
          calories: 450,
          protein: 28,
          carbs: 55,
          fat: 14,
          servingSize: '350g',
          ingredients: 'Quinoa, Tofu, Broccoli, Tahini, Lemon',
          price: 299,
          offerPrice: 249,
          status: 'Active',
          availability: 'Available',
          kitchen: 'Indore Central Cloud Kitchen',
          preparationTime: 15,
          featured: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await checkAndSeed('menuItems', menuItems);

      console.log("Database configuration verification/seeding completed.");
    } catch (error) {
      console.error("Database configuration verification/seeding failed:", error);
    }
  }
};
