export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    popular?: boolean;
    relatedIds?: string[];
}

export const FAQ_CATEGORIES = {
    orders: "Orders",
    subscription: "Subscription Plans",
    delivery: "Delivery",
    sarjapur: "Sarjapur Road Delivery",
    nutrition: "Meals & Nutrition",
    ingredients: "Ingredients & Allergies",
    payments: "Payments",
    offers: "Offers & Rewards",
    account: "Account",
    corporate: "Corporate & Bulk Orders",
    general: "General"
};

export const FAQ_DATA: FAQItem[] = [
    // --- 1. Orders ---
    {
        id: "ord-pause-flex",
        category: "orders",
        question: "Can I pause my Taaza Bites meal subscription?",
        answer: "Yes, Taaza Bites offers 100% flexible pausing with zero penalties. Whether you are traveling or eating out, you can pause your subscription via your dashboard or WhatsApp concierge. Your active days will be backed up as indefinite credit rollovers.",
        popular: true,
        relatedIds: ["sub-pause", "sub-skip"]
    },
    {
        id: "ord-place",
        category: "orders",
        question: "How do I place an order?",
        answer: "Placing an order with Taaza Bites is simple! Visit our Subscriptions section, choose a plan (Trial, Habit, or Lifestyle), select your diet preferences (Veg/Non-Veg), configure your meal slot (Lunch, Dinner, or Both), and check out securely. Your freshly prepared meals will start arriving from the next delivery cycle.",
        popular: true,
        relatedIds: ["sub-work", "del-areas"]
    },
    {
        id: "ord-sched",
        category: "orders",
        question: "Can I schedule my meals?",
        answer: "Yes! During checkout or via your User Dashboard, you can schedule specific delivery slots. Lunch is delivered between 8:00 AM and 12:00 PM, and Dinner is delivered between 4:00 PM and 8:00 PM. You can also pause or shift delivery days as needed.",
        relatedIds: ["del-slots", "sub-pause"]
    },
    {
        id: "ord-modify",
        category: "orders",
        question: "Can I modify my order?",
        answer: "Absolutely. You can modify your diet preference, delivery timing, or dislikes list directly from your User Dashboard up to 24 hours before your next scheduled delivery.",
        relatedIds: ["nut-custom", "sub-change"]
    },
    {
        id: "ord-cancel",
        category: "orders",
        question: "Can I cancel my order?",
        answer: "Yes, you can cancel an active order. If your subscription hasn't started yet, you'll receive a full refund. For active subscriptions, cancellations are calculated pro-rata for the remaining undelivered meals, subject to a 48-hour notice.",
        relatedIds: ["pay-refund", "sub-cancel"]
    },
    {
        id: "ord-track",
        category: "orders",
        question: "How do I track my order?",
        answer: "Once your meal leaves our cloud kitchen near HSR Layout, you will receive a real-time WhatsApp tracking link. You can also view the live status ('PREPARING', 'IN_TRANSIT', 'DELIVERED') in your Dashboard under Active Orders.",
        relatedIds: ["del-timings", "gen-contact"]
    },
    {
        id: "ord-delayed",
        category: "orders",
        question: "What if my order is delayed?",
        answer: "While we maintain a 98% on-time delivery record, heavy rains or Bengaluru traffic can occasionally cause delays. If your meal is delayed by more than 30 minutes, our delivery support team will notify you via WhatsApp with a live ETA.",
        relatedIds: ["del-timings", "ord-track"]
    },
    {
        id: "ord-unavailable",
        category: "orders",
        question: "What happens if I'm unavailable during delivery?",
        answer: "If you are unavailable, our delivery executive will contact you to leave the temperature-controlled compostable meal tray with your security guard, at your doorstep, or reschedule delivery.",
        relatedIds: ["del-timings", "ord-sched"]
    },

    // --- 2. Subscription Plans ---
    {
        id: "sub-work",
        category: "subscription",
        question: "How does the subscription work?",
        answer: "Taaza Bites offers a convenient subscription model. You choose a duration (5, 20, 60, or 90 days), set your dietary preferences, and we handle the daily chef-preparation and hot delivery. Your subscription pause/resume settings put you in complete control.",
        popular: true,
        relatedIds: ["sub-plans", "sub-pause"]
    },
    {
        id: "sub-plans",
        category: "subscription",
        question: "What plans are available?",
        answer: "We offer three main plans: 1) Trial (5 Days) - Perfect to sample our high-protein kitchen. 2) The Habit (20 Days) - Designed to establish clean eating consistency. 3) The Lifestyle (60/90 Days) - An immersive, complete nutritional transformation.",
        relatedIds: ["sub-work", "off-discounts"]
    },
    {
        id: "sub-pause",
        category: "subscription",
        question: "Can I pause my subscription?",
        answer: "Yes! If you are traveling or eating out, you can pause your subscription via the dashboard. Your plan will resume exactly where you left off. Just provide a 24-hour heads-up.",
        popular: true,
        relatedIds: ["sub-skip", "ord-sched"]
    },
    {
        id: "sub-skip",
        category: "subscription",
        question: "Can I skip delivery?",
        answer: "Yes, you can skip individual days. In your Dashboard calendar, tap on any upcoming delivery day and select 'Skip.' Your plan balance will automatically extend by one day.",
        relatedIds: ["sub-pause", "ord-sched"]
    },
    {
        id: "sub-change",
        category: "subscription",
        question: "Can I change my meal plan?",
        answer: "Yes, you can switch between Veg and Non-Veg, or change your fitness focus (e.g., from Weight Loss to Muscle Gain) anytime during your subscription period through your profile settings.",
        relatedIds: ["ord-modify", "nut-custom"]
    },
    {
        id: "sub-upgrade",
        category: "subscription",
        question: "Can I upgrade my subscription?",
        answer: "Of course! You can upgrade from a Trial to a Habit or Lifestyle plan directly from your dashboard. The remaining balance of your current plan will be applied as a pro-rata discount toward your upgrade.",
        relatedIds: ["sub-plans", "off-discounts"]
    },
    {
        id: "sub-cancel",
        category: "subscription",
        question: "Can I cancel anytime?",
        answer: "Yes, you can cancel your active subscription at any time. The refund will be credited back to your original payment method for all remaining un-delivered meals after a 48-hour processing window.",
        relatedIds: ["ord-cancel", "pay-refund"]
    },
    {
        id: "sub-expire",
        category: "subscription",
        question: "Do unused meals expire?",
        answer: "No, paused or skipped days simply extend the validity of your subscription. Unused meals will not expire as long as your subscription is paused before the daily cut-off time.",
        relatedIds: ["sub-pause", "sub-skip"]
    },

    // --- 3. Delivery ---
    {
        id: "del-areas",
        category: "delivery",
        question: "Which areas do you deliver to?",
        answer: "We deliver to all major pin codes across Bengaluru, with concentrated routes in HSR Layout, Koramangala, Sarjapur Road, Bellandur, Kasavanahalli, Haralur Road, Indiranagar, and Whitefield.",
        popular: true,
        relatedIds: ["del-timings", "del-free"]
    },
    {
        id: "del-timings",
        category: "delivery",
        question: "What are the delivery timings?",
        answer: "We deliver twice daily: Lunch is delivered between 8:00 AM and 12:00 PM (prepared fresh in the morning), and Dinner is delivered between 4:00 PM and 8:00 PM (prepared fresh in the afternoon).",
        relatedIds: ["ord-sched", "del-slots"]
    },
    {
        id: "del-free",
        category: "delivery",
        question: "Is delivery free?",
        answer: "Yes, daily delivery is 100% free for all our active subscription plans. There are no hidden service charges or distance-based surcharges.",
        relatedIds: ["del-areas", "sub-plans"]
    },
    {
        id: "del-weekends",
        category: "delivery",
        question: "Do you deliver on weekends?",
        answer: "Our standard plans deliver from Monday to Friday to give your palate a weekend break. However, we offer optional weekend add-ons during subscription configuration if you prefer continuous 7-day clean eating.",
        relatedIds: ["sub-plans", "ord-sched"]
    },
    {
        id: "del-slots",
        category: "delivery",
        question: "Can I choose a delivery slot?",
        answer: "Yes, during checkout or from your dashboard profile, you can select your preferred 2-hour window (e.g., 10:00 AM - 12:00 PM for lunch) to match your work schedule.",
        relatedIds: ["del-timings", "ord-sched"]
    },
    {
        id: "del-address",
        category: "delivery",
        question: "Can I change my delivery address?",
        answer: "Yes. If you are moving houses or working from the office for a day, you can update your delivery address in your Dashboard. Please update it before 8:00 PM on the previous day.",
        relatedIds: ["ord-modify", "acc-update"]
    },

    // --- 3b. Sarjapur Road Delivery ---
    {
        id: "sarj-outlet",
        category: "sarjapur",
        question: "Where is your outlet located on Sarjapur Road?",
        answer: "Our Central Flagship Kitchen and main dispatch outlet is located right on Sarjapur Main Road, Kasavanahalli (Bengaluru). Since our flagship facility is situated here, we are able to prepare, pack, and dispatch our meals with maximum proximity and absolute freshness to our neighbors.",
        popular: true,
        relatedIds: ["sarj-boundaries", "sarj-timings"]
    },
    {
        id: "sarj-timings",
        category: "sarjapur",
        question: "What are the estimated delivery times for Sarjapur Road?",
        answer: "Operating directly from our Kasavanahalli flagship kitchen, we offer priority express delivery slots for Sarjapur Road and adjacent areas. Breakfast is delivered between 7:15 AM and 8:45 AM, Lunch between 11:45 AM and 1:15 PM, and Dinner between 6:45 PM and 8:15 PM.",
        popular: true,
        relatedIds: ["sarj-outlet", "sarj-gated"]
    },
    {
        id: "sarj-boundaries",
        category: "sarjapur",
        question: "What are the specific service area boundaries for the Sarjapur outlet?",
        answer: "Our Sarjapur outlet services a comprehensive local boundary including Sarjapur Road, Kasavanahalli Main Road, Haralur Road, Kaikondrahalli, Bellandur, Carmelaram, Doddakannelli, Sarjapur Town, Chikkanayakanahalli, Junnasandra, Sompura, Kodathi, Halanayakanahalli, and Chikkakannelli. We also provide direct workspace delivery to major tech campuses such as the Wipro Sarjapur Road Campus, RGA Tech Park, RMZ Ecoworld, and RMZ Ecospace.",
        relatedIds: ["sarj-gated", "del-areas"]
    },
    {
        id: "sarj-gated",
        category: "sarjapur",
        question: "Do you deliver to gated societies along Sarjapur Road?",
        answer: "Yes! We provide daily priority deliveries directly to all major gated communities in the Sarjapur corridor, including Adarsh Palm Retreat, Sobha Royal Pavilion, Bren Avalon, SJR Verity, Salarpuria Sattva Senorita, Prestige Sunrise Park, Godrej Reflections, Shriram Chirping Woods, SJR Blue Waters, and Purva Whitehall. Our delivery executives are fully authorized to drop meals off at your doorstep, lobby, or security desk according to your preference.",
        relatedIds: ["sarj-boundaries", "sarj-verification"]
    },
    {
        id: "sarj-verification",
        category: "sarjapur",
        question: "How can I verify if my exact society or road is within the Sarjapur delivery zone?",
        answer: "You can instantly verify coverage by using the interactive location search widget on our Sarjapur Road Meal Delivery page. Alternatively, you can drop us a text on WhatsApp (+91 7975771457) with your location pin, and our logistics team will instantly confirm active service and assign your priority dispatch slot.",
        relatedIds: ["sarj-boundaries", "gen-contact"]
    },

    // --- 4. Meals & Nutrition ---
    {
        id: "nut-fresh",
        category: "nutrition",
        question: "Are meals freshly prepared?",
        answer: "Absolutely. Every single meal is cooked fresh from scratch in our state-of-the-art Bengaluru cloud kitchen just hours before delivery. We do not freeze or pre-package meals.",
        popular: true,
        relatedIds: ["nut-preservatives", "ing-sourcing"]
    },
    {
        id: "nut-preservatives",
        category: "nutrition",
        question: "Are preservatives used?",
        answer: "Never. We enforce a 100% preservative-free policy. We do not use any artificial colorants, MSG, or chemical stabilizers. Only fresh ingredients and cold-pressed premium oils are used.",
        relatedIds: ["nut-fresh", "ing-sourcing"]
    },
    {
        id: "nut-protein",
        category: "nutrition",
        question: "How much protein is in each meal?",
        answer: "Depending on your selected goal, our meals are highly protein-optimized. Vegetarian meals contain 22g to 28g of high-quality protein (paneer, tofu, edamame, sprouts). Non-vegetarian meals contain 35g to 45g of protein (lean chicken breast, whole eggs, fish).",
        relatedIds: ["nut-calories", "nut-gain"]
    },
    {
        id: "nut-calories",
        category: "nutrition",
        question: "Do you provide calorie information?",
        answer: "Yes, every single meal tray features a QR code scanning label that links to a detailed breakdown of total calories, protein, carbohydrates, fats, and dietary fibers, fully integrated with MyFitnessPal.",
        relatedIds: ["nut-protein", "ing-nutinfo"]
    },
    {
        id: "nut-loss",
        category: "nutrition",
        question: "Are meals suitable for weight loss?",
        answer: "Yes, our Weight Loss goal plan features calorie-controlled, low-glycemic, and fiber-rich meals (typically between 400-480 kcal) designed to keep you in a healthy caloric deficit while staying full.",
        relatedIds: ["nut-calories", "nut-protein"]
    },
    {
        id: "nut-gain",
        category: "nutrition",
        question: "Are meals suitable for muscle gain?",
        answer: "Yes! Our Muscle Gain/Hypertrophy goal plans feature higher complex carbohydrates and clean lean proteins (typically 550-650 kcal) to support high-intensity workouts and efficient muscle recovery.",
        relatedIds: ["nut-protein", "nut-calories"]
    },
    {
        id: "nut-diabetic",
        category: "nutrition",
        question: "Do you have diabetic-friendly meals?",
        answer: "Yes, our meals focus heavily on low-GI complex grains (quinoa, brown rice, millets) and contain absolutely zero refined sugars, making them highly suitable for maintaining stable blood sugar levels.",
        relatedIds: ["nut-pcos", "nut-calories"]
    },
    {
        id: "nut-pcos",
        category: "nutrition",
        question: "Do you have PCOS-friendly meals?",
        answer: "Yes, we offer anti-inflammatory, dairy-free, and low-insulin-spike meal variations designed specifically to support hormone regulation and insulin sensitivity for PCOS management.",
        relatedIds: ["nut-diabetic", "nut-custom"]
    },
    {
        id: "nut-keto",
        category: "nutrition",
        question: "Are keto meals available?",
        answer: "Yes, we have a fully dedicated Keto subscription option that restricts carbs to under 5% of daily macros, replacing them with high-quality healthy fats (avocados, nuts, organic ghee, olive oil) and moderate proteins.",
        relatedIds: ["sub-change", "nut-protein"]
    },
    {
        id: "nut-vegan",
        category: "nutrition",
        question: "Are vegan meals available?",
        answer: "Yes, our plant-based vegan option replaces all dairy and animal proteins with organic tofu, tempeh, plant proteins, and fresh leafy greens, maintaining premium high-protein standards.",
        relatedIds: ["sub-change", "nut-protein"]
    },
    {
        id: "nut-gluten",
        category: "nutrition",
        question: "Are gluten-free meals available?",
        answer: "Yes, we offer gluten-free meal profiles that replace wheat and barley with premium grain alternatives such as amaranth, red rice, buckwheat, and quinoa.",
        relatedIds: ["ing-allergies", "nut-custom"]
    },
    {
        id: "nut-custom",
        category: "nutrition",
        question: "Are meals customizable?",
        answer: "Yes, you can add up to 5 'disliked ingredients' (e.g., mushrooms, bell peppers, or coriander) to your profile, and our kitchen team will automatically omit or substitute them in your daily meals.",
        relatedIds: ["ord-modify", "ing-remove"]
    },

    // --- 5. Ingredients & Allergies ---
    {
        id: "ing-sourcing",
        category: "ingredients",
        question: "What ingredients are used?",
        answer: "We source premium, certified pesticide-free vegetables, organic grains, and hormone-free chicken from verified farms in Karnataka. We use only cold-pressed oils, organic Himalayan pink salt, and stone-ground spices.",
        relatedIds: ["nut-fresh", "nut-preservatives"]
    },
    {
        id: "ing-remove",
        category: "ingredients",
        question: "Can you remove certain ingredients?",
        answer: "Yes, our smart kitchen software allows you to exclude specific ingredients (e.g., dairy, peanuts, mustard, or specific vegetables) which our chefs will substitute to ensure your safety.",
        relatedIds: ["nut-custom", "ing-allergies"]
    },
    {
        id: "ing-allergies",
        category: "ingredients",
        question: "How do you handle food allergies?",
        answer: "While we take utmost care to prevent cross-contamination, our kitchen facility processes dairy, nuts, soy, and gluten. For severe, life-threatening allergies, we advise speaking directly with our nutritional team.",
        popular: true,
        relatedIds: ["ing-remove", "nut-custom"]
    },
    {
        id: "ing-nutinfo",
        category: "ingredients",
        question: "Is nutritional information available?",
        answer: "Yes, we list full ingredient lists and exact macronutrient breakdowns for every dish in our weekly menu section, as well as on your interactive dashboard.",
        relatedIds: ["nut-calories", "nut-protein"]
    },

    // --- 6. Payments ---
    {
        id: "pay-methods",
        category: "payments",
        question: "Which payment methods do you accept?",
        answer: "We accept all major Credit and Debit cards, Net Banking, UPI (Google Pay, PhonePe, Paytm), and major digital wallets. All transactions are securely processed via Razorpay with 256-bit encryption.",
        relatedIds: ["pay-cod", "pay-invoice"]
    },
    {
        id: "pay-cod",
        category: "payments",
        question: "Is Cash on Delivery available?",
        answer: "Because we cook fresh-to-order based on active subscription commitments, we require upfront online payment. We do not support Cash on Delivery (COD) for our subscriptions.",
        relatedIds: ["pay-methods", "ord-place"]
    },
    {
        id: "pay-refund",
        category: "payments",
        question: "How do refunds work?",
        answer: "Approved refunds for cancellations or paused days are initiated instantly and credited back to your original payment method (bank account, card, or UPI wallet) within 5 to 7 business days.",
        relatedIds: ["ord-cancel", "sub-cancel"]
    },
    {
        id: "pay-invoice",
        category: "payments",
        question: "Can I get an invoice?",
        answer: "Yes, a detailed GST invoice is automatically generated and emailed to you upon successful purchase. You can also view and download historic invoices anytime from your Dashboard.",
        relatedIds: ["pay-methods", "acc-update"]
    },

    // --- 7. Offers & Rewards ---
    {
        id: "off-referral",
        category: "offers",
        question: "Are there referral rewards?",
        answer: "Yes! Share your unique referral link from your profile. When your friend subscribes to a Habit or Lifestyle plan, they get 10% off, and you receive ₹500 worth of loyalty points credited to your wallet instantly.",
        relatedIds: ["off-points", "off-discounts"]
    },
    {
        id: "off-discounts",
        category: "offers",
        question: "Do you offer discounts?",
        answer: "Yes, we offer continuous pricing discounts built into our longer-duration plans: The Habit (20-day) includes an 8% discount, and The Lifestyle (60-day) includes a massive 15% discount compared to daily trial rates.",
        relatedIds: ["sub-plans", "off-referral"]
    },
    {
        id: "off-coupons",
        category: "offers",
        question: "Can I use coupon codes?",
        answer: "Yes, coupon codes can be applied in your shopping cart before proceeding to the checkout. We regularly run special offers which are announced via our WhatsApp newsletter.",
        relatedIds: ["pay-methods", "off-discounts"]
    },
    {
        id: "off-points",
        category: "offers",
        question: "How do loyalty points work?",
        answer: "For every rupee spent on Taaza Bites, you earn 1 loyalty point. Points accumulate in your profile and can be redeemed for free meal deliveries, premium cold-pressed wellness shots, or plan upgrades.",
        relatedIds: ["off-referral", "sub-upgrade"]
    },

    // --- 8. Account ---
    {
        id: "acc-create",
        category: "account",
        question: "How do I create an account?",
        answer: "To create an account, simply click the 'Sign In' button in our top navigation bar. You can instantly sign up using your Google Account for safe, secure, and hassle-free authentication.",
        relatedIds: ["acc-reset", "acc-update"]
    },
    {
        id: "acc-reset",
        category: "account",
        question: "How do I reset my password?",
        answer: "Because we use secure Google Single Sign-On (SSO), there are no passwords to manage or reset! Your login is securely managed by Google's multi-factor authentication.",
        relatedIds: ["acc-create", "acc-update"]
    },
    {
        id: "acc-update",
        category: "account",
        question: "How do I update my phone number?",
        answer: "You can update your phone number, delivery instructions, and WhatsApp contact preferences directly in your Account Settings tab within the User Dashboard.",
        relatedIds: ["del-address", "acc-create"]
    },
    {
        id: "acc-delete",
        category: "account",
        question: "How do I delete my account?",
        answer: "We are sorry to see you go! If you wish to delete your account and remove all personal information, please email us at support@taazabites.in, and our tech team will purge your data within 24 hours.",
        relatedIds: ["gen-contact", "acc-create"]
    },

    // --- 9. Corporate & Bulk Orders ---
    {
        id: "corp-meals",
        category: "corporate",
        question: "Do you provide office meals?",
        answer: "Yes, we cater to tech hubs, offices, and workspaces across Bengaluru. We provide bulk daily lunch deliveries with customized caloric and macro configurations tailored to your employee health goals.",
        relatedIds: ["corp-sub", "corp-quote"]
    },
    {
        id: "corp-sub",
        category: "corporate",
        question: "Can companies subscribe?",
        answer: "Yes, we offer corporate wellness subscription plans where employers can sponsor healthy daily lunches for their teams. We provide full analytics on employee engagement and health score improvements.",
        relatedIds: ["corp-meals", "corp-quote"]
    },
    {
        id: "corp-events",
        category: "corporate",
        question: "Do you cater for events?",
        answer: "Yes, we provide healthy, high-nutrition catering for corporate events, fitness retreats, and wellness workshops in Bengaluru, featuring live juice bars and organic grazing boards.",
        relatedIds: ["corp-meals", "corp-quote"]
    },
    {
        id: "corp-quote",
        category: "corporate",
        question: "How can I request a quotation?",
        answer: "You can request a bulk corporate quotation by navigating to our Corporate section and filling out our wellness projection estimator, or by emailing us at corporate@taazabites.in.",
        relatedIds: ["corp-meals", "corp-sub"]
    },

    // --- 10. General ---
    {
        id: "gen-why",
        category: "general",
        question: "Why choose Taaza Bites?",
        answer: "Unlike generic food delivery services, Taaza Bites is a specialized nutrition-first partner. We offer macro-calculated, freshly cooked, pesticide-free Indian meals without preservatives, supporting you with active dietitian guidance and a flexible pause-anytime dashboard.",
        popular: true,
        relatedIds: ["gen-different", "nut-fresh"]
    },
    {
        id: "gen-location",
        category: "general",
        question: "Where are you located?",
        answer: "Our central high-tech production kitchen is located in Bengaluru, Karnataka, strategically positioned to service key sectors with hot, fresh, temperature-controlled delivery vehicles.",
        relatedIds: ["del-areas", "nut-fresh"]
    },
    {
        id: "gen-support",
        category: "general",
        question: "What are your customer support hours?",
        answer: "Our customer support team is available via WhatsApp and Phone from 7:00 AM to 9:00 PM, Monday through Sunday, to assist you with active delivery, timing changes, or plan questions.",
        relatedIds: ["gen-contact", "ord-track"]
    },
    {
        id: "gen-contact",
        category: "general",
        question: "How do I contact support?",
        answer: "You can connect instantly with our team by tapping the WhatsApp floating button, clicking 'Chat with Support' on our contact page, or calling us directly at +91 7975771457.",
        relatedIds: ["gen-support", "ord-delayed"]
    },
    {
        id: "gen-different",
        category: "general",
        question: "Why is Taaza Bites different from other healthy meal services?",
        answer: "We are the only meal service that combines premium organic farm sourcing, hyper-personalized macro configuration, custom ingredient exclusion list filters, and complete container compostability—all delivered daily without middleman delivery fees.",
        relatedIds: ["gen-why", "nut-preservatives"]
    }
];
