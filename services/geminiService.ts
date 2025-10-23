
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization for the AI client to prevent app crash on load
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable not set.");
            // This error will be caught by the calling functions and displayed to the user.
            throw new Error("API Key is not configured. AI features are unavailable.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

const MENU_DATA = [
    "High Protein Egg Chicken Meal (High-Protein, Keto)",
    "Dry Fruit Chia Pudding (Vegetarian, High-Carb)",
    "Premium Chicken Pink Pasta (High-Protein, Carb-Focused)",
    "Chickpea Feta Avocado Bowl (Vegetarian, Gluten-Free option)",
    "Protein Scramble: Chicken Egg & Rice Bowl (High-Protein, Carb-Focused)",
    "Dry Fruit Whey Protein Shake (High-Protein, Keto option)",
    "Quinoa Power Bowl with Grilled Paneer (Vegetarian, High-Protein)",
    "Spicy Tofu Stir-fry with Brown Rice (Vegetarian, Carb-Focused)",
    "Salmon and Asparagus Medley (High-Protein, Keto)",
    "Millet Upma with Vegetables (Vegetarian, High-Carb)",
].map(d => d.split(' (')[0]).join(', ');


const generateContentWithRetry = async (prompt: string, systemInstruction: string) => {
  try {
    const client = getAiClient();
    const model = client.models;
    const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to get a response from the AI. Please try again.");
  }
};

const generateJsonContentWithRetry = async (prompt: string, systemInstruction: string, responseSchema: any) => {
    try {
        const client = getAiClient();
        const model = client.models;
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating JSON content from Gemini:", error);
        throw new Error("AI failed to generate a valid plan. Please check your inputs and try again.");
    }
};


export const generateMealPlan = async (
  dietaryPreference: string,
  healthGoal: string,
  dislikes: string,
  nutritionalGoals: string
) => {
  const systemInstruction = `You are a helpful, world-class nutritionist and chef working for Taazabites. Your task is to generate a personalized 1-day meal plan (Breakfast, Lunch, Dinner) based *only* on the meals provided in the Taazabites Menu. Do not suggest anything outside of this menu.

Taazabites Menu: ${MENU_DATA}

Output the plan in a *STRICT*, parsable format. Each meal must be on a new line and must start exactly with the bracketed meal type followed by a pipe and the meal name, then another pipe and a brief reason. After the three meals, add a final line starting with [SUMMARY]| followed by a single encouraging sentence summarizing the plan's benefits.

Example:
[BREAKFAST]|High Protein Egg Chicken Meal|This meal is perfect for muscle gain.
[LUNCH]|Chickpea Feta Avocado Bowl|This light yet filling bowl is great for sustained energy.
[DINNER]|Protein Scramble: Chicken Egg & Rice Bowl|A balanced carb/protein mix to fuel recovery.
[SUMMARY]|This plan is designed to maximize muscle gain while keeping you energized throughout the day!

The plan must strictly adhere to the user's preferences, including any specific nutritional goals. If a user dislikes an ingredient, do not suggest a meal containing it.`;

  const userQuery = `Create a 1-day plan for a user with these preferences:
- Dietary Preference: ${dietaryPreference}
- Health Goal: ${healthGoal}
- Specific Nutritional Goals: ${nutritionalGoals || 'None'}
- Dislikes/Allergies: ${dislikes || 'None'}`;
  
  return generateContentWithRetry(userQuery, systemInstruction);
};

export const generateSubscriptionProjection = async (
    weight: number,
    height: number,
    age: number,
    gender: string,
    goal: string
) => {
    const systemInstruction = `You are an expert nutritionist for Taazabites, a healthy meal delivery service. Your goal is to provide a realistic and motivating 1-month projection for a user based on their stats. The diet is assumed to be a balanced, calorie-controlled plan provided by Taazabites. You must respond in the specified JSON format.
- For weight loss, project a healthy rate of 0.5-1kg loss per week.
- For muscle gain, project a realistic rate of 0.25-0.5kg of lean muscle per month.
- For maintenance, confirm that the user can maintain their weight.
- Base your recommendation for 'Monthly Motivator' on goals that require consistency (weight loss/gain). Recommend 'Weekly Warrior' for maintenance or trial.`;

    const userQuery = `Generate a projection for a user with the following details:
- Weight: ${weight}kg
- Height: ${height}cm
- Age: ${age}
- Gender: ${gender}
- Health Goal: ${goal}`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            projectionText: {
                type: Type.STRING,
                description: "A short, catchy projection, e.g., 'Lose up to 3kg of fat!' or 'Gain up to 0.5kg of lean muscle!'"
            },
            detailedExplanation: {
                type: Type.STRING,
                description: "1-2 sentences explaining how this is possible with a consistent, healthy diet from Taazabites."
            },
            recommendedPlan: {
                type: Type.STRING,
                description: "The name of the recommended plan: either 'Weekly Warrior' or 'Monthly Motivator'."
            }
        },
        required: ['projectionText', 'detailedExplanation', 'recommendedPlan']
    };

    const result = await generateJsonContentWithRetry(userQuery, systemInstruction, schema);
    return JSON.parse(result);
};

export const generateAiSearchResults = async (query: string) => {
    const systemInstruction = `You are a helpful AI assistant for Taazabites, a healthy food delivery service in Bangalore. Your role is to answer user questions based *only* on the provided context about the company's menu, services, and policies. Be friendly, concise, and helpful. If the answer isn't in the context, politely state that you don't have that information. Do not make anything up. Format your answer using markdown for clarity (e.g., use lists, bold text).`;
    
    const context = `
    **About Taazabites:**
    Taazabites is a premium healthy food delivery service in Bangalore. Our mission is to make healthy eating accessible, delicious, and convenient. Our meals are created by a team of chefs and nutritionists. We are committed to sustainability and source locally. We have served over 25,000 meals with a 98% satisfaction rate.

    **Menu Items:**
    - High Protein Egg Chicken Meal (Keto, High-Protein)
    - Dry Fruit Chia Pudding (Vegetarian)
    - Premium Chicken Pink Pasta (High-Protein)
    - Chickpea Feta Avocado Bowl (Vegetarian)
    - Protein Scramble Rice Bowl (High-Protein)
    - Dry Fruit Whey Protein Shake (Keto, High-Protein)
    
    **Subscription Plans:**
    - Weekly Warrior: ₹1,799/week for 5 meals. Good for trying us out.
    - Monthly Motivator: ₹6,499/month for 20 meals. Best value and savings. You can pause or resume anytime.
    - Corporate Fuel: Custom pricing for teams of 10+.
    
    **Corporate Services:**
    We offer customized meal plans for corporate teams in Bangalore. We provide flexible delivery, dedicated account managers, and custom budgeting.
    
    **Delivery & Ordering:**
    We deliver to all major areas of Bangalore. Orders should be placed 4 hours in advance for same-day delivery.
    
    **Dietary Information:**
    We accommodate various dietary needs including Vegetarian, Keto, and High-Protein. Customers can specify dislikes and allergies.
    `;
    
    const userQuery = `
    CONTEXT:
    ---
    ${context}
    ---
    
    QUESTION: "${query}"
    
    Based only on the context provided, answer the user's question.
    `;
    
    return generateContentWithRetry(userQuery, systemInstruction);
};
