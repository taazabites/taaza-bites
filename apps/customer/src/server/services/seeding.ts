
import { adminDb } from "../../firebase/firebase-admin.ts";

export async function seedPlansIfNeeded() {
  const plansRef = adminDb.collection("subscriptionPlans");
  
  // Clean up old placeholder plans to avoid duplication/clutter
  const oldPlanIds = ["baseline", "metabolic-reset", "performance-pro"];
  for (const id of oldPlanIds) {
    await plansRef.doc(id).delete().catch(err => console.warn(`Failed to delete old plan ${id}:`, err));
  }

  const plans = [
    {
      id: "trial_3",
      planId: "trial_3",
      name: "3 Day Trial",
      price: 999,
      offerPrice: 999,
      durationDays: 3,
      caloriesTarget: 1500,
      mealsPerDay: 1,
      description: "Sample our fresh, healthy meals for 3 days and experience the difference.",
      active: true,
      displayOrder: 1,
      features: [
        "3 Days of fresh, healthy meals",
        "Tailored calorie and macro balancing",
        "Zero commitment trial",
        "Free doorstep delivery"
      ]
    },
    {
      id: "weekly",
      planId: "weekly",
      name: "Weekly Plan",
      price: 2240,
      offerPrice: 2240,
      durationDays: 7,
      caloriesTarget: 1800,
      mealsPerDay: 1,
      description: "Establish solid nutrition habits. Perfect 7 days of healthy chef-cooked meals.",
      active: true,
      displayOrder: 2,
      features: [
        "7 Days of fresh, healthy meals",
        "Pause and resume schedule anytime",
        "Certified dietitian support",
        "Includes morning/lunch delivery"
      ]
    },
    {
      id: "plan_15",
      planId: "plan_15",
      name: "15 Day Plan",
      price: 4500,
      offerPrice: 4050,
      durationDays: 15,
      caloriesTarget: 1800,
      mealsPerDay: 1,
      description: "Intermediate health refresh. Clean energy and constant daytime focus.",
      active: true,
      displayOrder: 3,
      features: [
        "15 Days of rotating chef-curated menu",
        "Bi-weekly wellness consultations",
        "Flexible address swapping anytime",
        "Daytime focus-optimized meals"
      ]
    },
    {
      id: "plan_30",
      planId: "plan_30",
      name: "30 Day Plan",
      price: 8400,
      offerPrice: 7140,
      durationDays: 30,
      caloriesTarget: 2000,
      mealsPerDay: 1,
      description: "Complete lifestyle alignment. Full 30 days of clean, wholesome energy and custom nutrition.",
      active: true,
      displayOrder: 4,
      popular: true,
      features: [
        "30 Days of premium meal protocols",
        "Unlimited direct nutritionist consultations",
        "Unlimited flexible pause requests",
        "Highest cost savings and premium ingredients"
      ]
    }
  ];

  for (const plan of plans) {
    await plansRef.doc(plan.id).set({ ...plan, createdAt: new Date().toISOString() });
  }
}

export async function seedCouponsIfNeeded() {
  const couponsRef = adminDb.collection("coupons");
  const couponsSnap = await couponsRef.limit(1).get();
  
  if (couponsSnap.empty) {
    console.log("Seeding default coupons...");
    const coupons = [
      {
        code: "TAAZA10",
        discountType: "percentage",
        discountValue: 10,
        minOrder: 1000,
        maxDiscount: 500,
        active: true,
        expiryDate: "2026-12-31"
      },
      {
        code: "WELCOME500",
        discountType: "flat",
        discountValue: 500,
        minOrder: 2000,
        active: true,
        expiryDate: "2026-12-31"
      }
    ];

    for (const coupon of coupons) {
      await couponsRef.doc(coupon.code).set({ ...coupon, createdAt: new Date().toISOString() });
    }
  }
}

export async function seedServiceAreasIfNeeded() {
  const areasRef = adminDb.collection("serviceAreas");
  const areasSnap = await areasRef.limit(1).get();
  
  if (areasSnap.empty) {
    console.log("Seeding service areas...");
    // We already have logic in the frontend service, but let's keep it here too for server-side initialization
    const defaults = [
      { city: "Bangalore", area: "Kasavanahalli", pincodes: ["560035", "560099"], active: true },
      { city: "Bangalore", area: "Sarjapur Road", pincodes: ["560103", "560087"], active: true }
    ];
    for (let i = 0; i < defaults.length; i++) {
      await areasRef.doc(`sa_${i}`).set({ ...defaults[i], createdAt: new Date().toISOString() });
    }
  }
}
