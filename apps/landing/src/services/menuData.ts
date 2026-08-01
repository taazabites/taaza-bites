import { PORTAL_LINKS } from '../config';
export const MENU_DATA_DETAILED = [
    {
        name: "High Protein Egg Chicken Meal",
        price: "349",
        description: "A powerhouse meal with tender chicken, boiled eggs, and fresh veggies. Perfect for muscle recovery.",
        imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/HYC3ipj-ea1cb459-9f06-4842-9f10-c36beef7395f.jpg",
        tags: ["high-protein", "keto", "chefs-pick"],
        nutritionInfo: "Calories: 450 kcal, Protein: 42g, Net Carbs: 8g, Fat: 28g, Fiber: 2g",
        orderLink: PORTAL_LINKS.order
    },
    {
        name: "Quinoa Power Bowl with Grilled Paneer",
        price: "379",
        description: "Nutrient-dense quinoa topped with spiced grilled paneer and colorful vegetables for sustained energy.",
        imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/10/25/XQI0vGF-c0de1c2c-b08a-4bf6-94b7-7cb7547c811a.jpg",
        tags: ["vegetarian", "high-protein", "healthy-start"],
        nutritionInfo: "Calories: 480 kcal, Protein: 25g, Carbs: 50g, Fat: 20g, Fiber: 10g",
        orderLink: PORTAL_LINKS.order
    },
    {
        name: "Premium Chicken Pink Pasta",
        price: "459",
        description: "Whole wheat pasta tossed in a creamy, low-fat beetroot and tomato sauce with grilled chicken.",
        imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/11/04/FzHllQL-b5013e53-f312-455d-9ef5-7c51f71950e2.jpg",
        tags: ["high-protein", "indulgent"],
        nutritionInfo: "Calories: 580 kcal, Protein: 38g, Carbs: 55g, Fat: 25g, Fiber: 5g",
        orderLink: PORTAL_LINKS.order
    },
    {
        name: "Dry Fruit Whey Protein Shake",
        price: "269",
        description: "A delicious blend of whey protein and premium dry fruits for a quick post-workout boost.",
        imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/11/04/QtQwbdS-b1dac60a-b8d1-4328-8334-46a9cd114720.jpg",
        tags: ["high-protein", "keto", "healthy-boost"],
        nutritionInfo: "Calories: 380 kcal, Protein: 28g, Carbs: 30g, Fat: 18g, Sugar: 20g",
        orderLink: PORTAL_LINKS.order
    },
    {
        name: "Dry Fruit Chia Pudding",
        price: "319",
        description: "Creamy chia pudding loaded with omega-3s and topped with crunchy dry fruits.",
        imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/s9ZRSy5-f46b9d1a-8aca-471a-ae55-11652376cce1.jpg",
        tags: ["vegetarian", "healthy-start", "healthy-boost"],
        nutritionInfo: "Calories: 350 kcal, Protein: 12g, Carbs: 45g, Fat: 15g, Fiber: 15g",
        orderLink: PORTAL_LINKS.order
    },
    {
        name: "Protein Scramble Rice Bowl",
        price: "349",
        description: "Fluffy scrambled eggs and lean chicken served over seasoned brown rice.",
        imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/09/5x3bE-3c79d21a-07b6-498b-81fa-649a1c953380.jpg",
        tags: ["high-protein"],
        nutritionInfo: "Calories: 520 kcal, Protein: 40g, Carbs: 35g, Fat: 24g, Fiber: 4g",
        orderLink: PORTAL_LINKS.order
    },
];

export const MENU_STRING = MENU_DATA_DETAILED.map(item =>
  `- ${item.name} (Tags: ${item.tags.join(', ')}; Nutrition: ${item.nutritionInfo})`
).join('\n');