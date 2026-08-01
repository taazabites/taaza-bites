export interface PageMetadata {
  title: string;
  description: string;
  canonical?: string;
  breadcrumbName?: string;
  ogImage?: string;
  twitterImage?: string;
}

export const seoConfig: { [key: string]: PageMetadata } = {
  "/": {
    title: "Taazabites | #1 Healthy Meal Delivery & High-Protein Subscriptions Bengaluru",
    description:
      "Taazabites delivers fresh, chef-crafted premium high-protein diet meals across Bengaluru tech hubs. Enjoy macro-calculated, dietitian-approved healthy food delivered daily.",
    canonical: "https://www.taazabites.in",
    breadcrumbName: "Home",
  },
  "/menu": {
    title:
      "Our Healthy Menu | Premium Meals Bengaluru | Taazabites",
    description:
      "Explore our weekly menu of nutritious premium meals. From High-Protein Egg Chicken to Quinoa Power Bowls, fuel your body with Bangalore's best healthy food.",
    canonical: "https://www.taazabites.in/menu",
    breadcrumbName: "Menu",
  },
  "/subscriptions": {
    title:
      "Healthy Subscription Plans Bengaluru | Taazabites",
    description:
      "Save on your health journey with our flexible subscription modules. Choose from 5, 20, or 60-day premium meal plans for peak vitality in Bengaluru.",
    canonical: "https://www.taazabites.in/subscriptions",
    breadcrumbName: "Subscriptions",
    ogImage:
      "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
    twitterImage:
      "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
  },
  "/corporate-booking": {
    title:
      "Corporate Wellness Catering Bangalore | Taazabites",
    description:
      "Boost employee productivity with premium healthy catering. Taazabites provides the most reliable premium office lunch delivery in Bangalore.",
    canonical: "https://www.taazabites.in/corporate-booking",
    breadcrumbName: "Corporate",
  },
  "/why-us": {
    title: "Why Choose Taazabites | Healthy Meal Delivery Bangalore",
    description:
      "Discover why Taazabites is Bangalore's top choice for healthy meal delivery. We use 100% premium ingredients, clinical-grade safety, and AI-verified macros.",
    canonical: "https://www.taazabites.in/why-us",
    breadcrumbName: "Why Us",
  },
  "/about": {
    title: "About Taazabites | Our Healthy Mission in Bangalore",
    description:
      "Born in Bengaluru, Taazabites is more than a kitchen. We are a biological OS for nutrition, engineered for high-performance living through premium sourcing.",
    canonical: "https://www.taazabites.in/about",
    breadcrumbName: "About",
  },
  "/commutes": {
    title: "Track Your Meal Delivery Live in Bangalore | Taazabites",
    description:
      "Monitor your nutritious meal delivery in real-time through the Bengaluru logistics grid.",
    canonical: "https://www.taazabites.in/commutes",
    breadcrumbName: "Track Delivery",
  },
  "/faq": {
    title:
      "Frequently Asked Questions | Taazabites Bangalore",
    description:
      "Find answers to your questions about our healthy meal plans, delivery areas in Bangalore, nutrition, and subscription options.",
    canonical: "https://www.taazabites.in/faq",
    breadcrumbName: "FAQ",
  },
  "/testimonials": {
    title: "Customer Reviews & Success Stories | Taazabites Bengaluru",
    description:
      "Read what our customers in Bangalore say about their health journey with Taazabites. Real reviews from real people achieving peak vitality.",
    canonical: "https://www.taazabites.in/testimonials",
    breadcrumbName: "Testimonials",
  },
  "/contact": {
    title:
      "Contact Us | Healthy Meal Delivery Bangalore",
    description:
      "Get in touch with Taazabites for any queries regarding your healthy meal plan, corporate catering, or support in Bengaluru.",
    canonical: "https://www.taazabites.in/contact",
    breadcrumbName: "Contact",
  },
  "/careers": {
    title: "Careers at Taaza Bites | Jobs in Bangalore",
    description:
      "Join Taaza Bites and build your career with Bangalore's growing healthy food brand. Apply for kitchen, chef, delivery, marketing and customer support jobs today.",
    canonical: "https://www.taazabites.in/careers",
    breadcrumbName: "Careers",
  },
  "/shipping": {
    title: "Shipping Policy | Taazabites Bengaluru",
    description:
      "Information regarding our delivery times, areas, and protocols in Bangalore.",
    canonical: "https://www.taazabites.in/shipping",
    breadcrumbName: "Shipping Policy",
  },
  "/refund": {
    title: "Return and Refund Policy | Taazabites Bengaluru",
    description:
      "Read our policy on returns and refunds for your meal delivery orders.",
    canonical: "https://www.taazabites.in/refund",
    breadcrumbName: "Refund Policy",
  },
  "/privacy": {
    title: "Privacy Policy | Taazabites Bengaluru",
    description:
      "Learn how Taazabites protects your personal information and maintains data security for our users in Bangalore.",
    canonical: "https://www.taazabites.in/privacy",
    breadcrumbName: "Privacy Policy",
  },
  "/nutrition-approach": {
    title: "Our Nutrition Approach | Taazabites Bengaluru",
    description:
      "Learn about the biological OS approach to healthy food delivery in Bangalore.",
    canonical: "https://www.taazabites.in/nutrition-approach",
    breadcrumbName: "Nutrition Approach",
  },
  "/terms": {
    title: "Terms of Use | Taazabites Bengaluru",
    description:
      "Terms and conditions for using Taazabites healthy meal delivery services in Bangalore.",
    canonical: "https://www.taazabites.in/terms",
    breadcrumbName: "Terms of Use",
  },
  "/health-assessment": {
    title: "Health Assessment Form | Taazabites Bengaluru",
    description:
      "Tell us about your goals, lifestyle, and food preferences so we can craft a meal plan that fits you perfectly.",
    canonical: "https://www.taazabites.in/health-assessment",
    breadcrumbName: "Health Assessment Form",
  },
  "/blog": {
    title: "Nutrition & Health Blog | Taazabites Bengaluru",
    description:
      "Insights on nutrition science, clean eating in Bengaluru, and maintaining a high-performance biological OS.",
    canonical: "https://www.taazabites.in/blog",
    breadcrumbName: "Journal",
  },
  "/weight-loss-meal-plan-bangalore": {
    title: "Best Weight Loss Meal Plan in Bangalore | Taazabites",
    description: "Scientifically-backed weight loss meal delivery focused on caloric deficit. Freshly crafted macro meals in Bengaluru.",
    canonical: "https://www.taazabites.in/weight-loss-meal-plan-bangalore",
    breadcrumbName: "Weight Loss Meal Plan",
    ogImage: "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
    twitterImage: "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg"
  },
  "/high-protein-meals-bangalore": {
    title: "High Protein Meals Delivered in Bangalore | Taazabites",
    description: "Achieve your hypertrophy goals with high-protein, perfectly portioned meal delivery crafted for active professionals in Bengaluru.",
    canonical: "https://www.taazabites.in/high-protein-meals-bangalore",
    breadcrumbName: "High Protein Meals",
    ogImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/pcos-meal-plan-bangalore": {
    title: "PCOS Supportive Meal Plan in Bangalore | Taazabites",
    description: "Manage hormones with specialized PCOS meal subscriptions. Low-GI, anti-inflammatory, and delicious deliveries in Bengaluru.",
    canonical: "https://www.taazabites.in/pcos-meal-plan-bangalore",
    breadcrumbName: "PCOS Meal Plan",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/healthy-food-subscription-bangalore": {
    title: "Healthy Food Subscription in Bangalore | Taazabites",
    description: "Subscribe to Bengaluru's top macro-calculated, fresh-cooked healthy food delivery. Your daily nutrition sorted.",
    canonical: "https://www.taazabites.in/healthy-food-subscription-bangalore",
    breadcrumbName: "Healthy Food Subscription",
    ogImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/macro-calculator": {
    title: "Macro & Calorie Calculator Bangalore | Taazabites",
    description: "Calculate your custom daily calories, protein, carbs, and fat breakdown based on your exact body stats and fitness goal. Fuel your body scientifically in Bangalore.",
    canonical: "https://www.taazabites.in/macro-calculator",
    breadcrumbName: "Macro Calculator",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-hsr-layout": {
    title: "Premium Healthy Meal Delivery in HSR Layout | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in HSR Layout, Bengaluru. Fresh, macro-calculated diet food subscriptions for Weight Loss, Keto, and High-Protein.",
    canonical: "https://www.taazabites.in/meal-delivery-hsr-layout",
    breadcrumbName: "HSR Layout Delivery",
    ogImage: "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
    twitterImage: "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg"
  },
  "/meal-delivery-koramangala": {
    title: "Healthy Meal Delivery in Koramangala | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Koramangala, Bengaluru. Freshly prepared, macro-calculated diet plans for professionals & families.",
    canonical: "https://www.taazabites.in/meal-delivery-koramangala",
    breadcrumbName: "Koramangala Delivery",
    ogImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-whitefield": {
    title: "Premium Healthy Meal Delivery in Whitefield | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Whitefield, Bengaluru. Zero preservative macro meals delivered directly to tech parks and residences.",
    canonical: "https://www.taazabites.in/meal-delivery-whitefield",
    breadcrumbName: "Whitefield Delivery",
    ogImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-indiranagar": {
    title: "Healthy Meal Delivery in Indiranagar | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Indiranagar, Bengaluru. Enjoy highly customizable calorie-deficit, keto, and high-protein meals.",
    canonical: "https://www.taazabites.in/meal-delivery-indiranagar",
    breadcrumbName: "Indiranagar Delivery",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-sarjapur-road": {
    title: "Healthy Meal Delivery in Sarjapur Road | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Sarjapur Road & Kasavanahalli, Bengaluru. Diet plans optimized for fitness and weight management.",
    canonical: "https://www.taazabites.in/meal-delivery-sarjapur-road",
    breadcrumbName: "Sarjapur Road Delivery",
    ogImage: "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg",
    twitterImage: "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg"
  },
  "/meal-delivery-kasavanahalli": {
    title: "Premium Healthy Meal Delivery in Kasavanahalli | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Kasavanahalli, Bengaluru. Enjoy highly customizable calorie-deficit, keto, and high-protein meals cooked-to-order.",
    canonical: "https://www.taazabites.in/meal-delivery-kasavanahalli",
    breadcrumbName: "Kasavanahalli Delivery",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-haralur": {
    title: "Premium Healthy Meal Delivery in Haralur | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Haralur Road, Bengaluru. Farm-fresh, preservative-free macro meals delivered directly to gated communities.",
    canonical: "https://www.taazabites.in/meal-delivery-haralur",
    breadcrumbName: "Haralur Delivery",
    ogImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-bellandur": {
    title: "Premium Healthy Meal Delivery in Bellandur | Taazabites",
    description: "Dietician-approved healthy diet meal delivery in Bellandur, Bengaluru. Macro-precise lunch & dinner subscriptions delivered to tech parks and homes.",
    canonical: "https://www.taazabites.in/meal-delivery-bellandur",
    breadcrumbName: "Bellandur Delivery",
    ogImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-marathahalli": {
    title: "Premium Healthy Meal Delivery in Marathahalli | Taazabites",
    description: "Calorie-counted and protein-dense healthy meal delivery in Marathahalli, Bengaluru. Daily fresh tiffin delivery for fitness-focused professionals.",
    canonical: "https://www.taazabites.in/meal-delivery-marathahalli",
    breadcrumbName: "Marathahalli Delivery",
    ogImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-electronic-city": {
    title: "Premium Healthy Meal Delivery in Electronic City | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Electronic City, Bengaluru. Safe, preservative-free high-protein and keto subscriptions delivered to E-City Phase 1 & 2.",
    canonical: "https://www.taazabites.in/meal-delivery-electronic-city",
    breadcrumbName: "Electronic City Delivery",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-jp-nagar": {
    title: "Premium Healthy Meal Delivery in JP Nagar | Taazabites",
    description: "Customized premium diet meal delivery in JP Nagar, Bengaluru. Enjoy portion-controlled keto, diabetic, and weight loss subscriptions at your doorstep.",
    canonical: "https://www.taazabites.in/meal-delivery-jp-nagar",
    breadcrumbName: "JP Nagar Delivery",
    ogImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-jayanagar": {
    title: "Premium Healthy Meal Delivery in Jayanagar | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Jayanagar, Bengaluru. Enjoy organic grains and pesticide-free fresh food prepared daily with zero preservatives.",
    canonical: "https://www.taazabites.in/meal-delivery-jayanagar",
    breadcrumbName: "Jayanagar Delivery",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-btm-layout": {
    title: "Premium Healthy Meal Delivery in BTM Layout | Taazabites",
    description: "High-protein and fat-loss healthy tiffin delivery in BTM Layout, Bengaluru. High-quality macro-calculated food subscriptions with zero shipping fees.",
    canonical: "https://www.taazabites.in/meal-delivery-btm-layout",
    breadcrumbName: "BTM Layout Delivery",
    ogImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-hebbal": {
    title: "Premium Healthy Meal Delivery in Hebbal | Taazabites",
    description: "Premium healthy diet meal delivery in Hebbal, Bengaluru. Freshly prepared macro meal plans delivered directly to residences and Manyata Tech Park.",
    canonical: "https://www.taazabites.in/meal-delivery-hebbal",
    breadcrumbName: "Hebbal Delivery",
    ogImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-yelahanka": {
    title: "Premium Healthy Meal Delivery in Yelahanka | Taazabites",
    description: "Nutritious, dietician-approved healthy meal delivery in Yelahanka, Bengaluru. Maintain glycemic balance and build lean muscle with custom daily meal prep.",
    canonical: "https://www.taazabites.in/meal-delivery-yelahanka",
    breadcrumbName: "Yelahanka Delivery",
    ogImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/meal-delivery-mahadevapura": {
    title: "Premium Healthy Meal Delivery in Mahadevapura | Taazabites",
    description: "Chef-crafted healthy diet meal delivery in Mahadevapura, Bengaluru. Clean eating subscriptions delivered to tech corridors and residential towers daily.",
    canonical: "https://www.taazabites.in/meal-delivery-mahadevapura",
    breadcrumbName: "Mahadevapura Delivery",
    ogImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop",
    twitterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format,compress&fit=crop"
  },
  "/seo-strategy": {
    title: "10-Layer Semantic SEO Strategy Framework | Taazabites",
    description: "Explore the 10-layer semantic SEO strategy framework of Taazabites to rank organic search entities #1 in health and fitness niches in Bangalore.",
    canonical: "https://www.taazabites.in/seo-strategy",
    breadcrumbName: "SEO Strategy Hub"
  },
  "/protein-meals-bellandur": {
    title: "High-Protein Meal Delivery Bellandur | Macro-Sync Subscriptions",
    description: "Get high-protein, calorie-counted meals delivered to RMZ Ecospace and corporate offices in Bellandur. Bengaluru's #1 athlete nutrition plan.",
    canonical: "https://www.taazabites.in/protein-meals-bellandur",
    breadcrumbName: "Bellandur Protein Meals",
  },
  "/keto-meals-sarjapur-road": {
    title: "Premium Keto Meal Subscription Sarjapur Road | Low-Carb Delivery",
    description: "Scientific Keto and low-carb meal plans delivered across Sarjapur Road and Kasavanahalli. Real-time macro tracking included.",
    canonical: "https://www.taazabites.in/keto-meals-sarjapur-road",
    breadcrumbName: "Sarjapur Keto Meals",
  },
  "/healthy-food-subscription-indiranagar": {
    title: "Healthy Food Subscription Indiranagar | Clean Eating Delivery",
    description: "Enjoy premium clean eating meal subscriptions in Indiranagar. Macro-calculated Indian diets for professionals and active lifestyles.",
    canonical: "https://www.taazabites.in/healthy-food-subscription-indiranagar",
    breadcrumbName: "Indiranagar Healthy Food",
  },
  "/weight-loss-meals-koramangala": {
    title: "Weight Loss Meal Plan Koramangala | Calorie-Deficit Delivery",
    description: "Effective weight loss meal subscriptions in Koramangala. Calorie-counted, chef-crafted Indian diets delivered fresh daily.",
    canonical: "https://www.taazabites.in/weight-loss-meals-koramangala",
    breadcrumbName: "Koramangala Weight Loss",
  },
};
