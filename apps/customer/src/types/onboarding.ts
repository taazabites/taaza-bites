export type OnboardingState = {
  // Step 1
  age: string;
  gender: string;
  height: string;
  weight: string;
  activity: string;
  medicalConditions: string[];
  allergies: string[];
  foodPreference: string;
  location: string;
  cookingFrequency: string;
  budget: string;

  // Step 2
  goal: string;

  // Step 5 (Customization)
  mealsPerDay: string;
  mealTypes: string[];
  proteinLevel: string;
  calories: string;
  deliveryTiming: string;
  cuisine: string;
  spiceLevel: string;
  avoidIngredients: string[];
};
