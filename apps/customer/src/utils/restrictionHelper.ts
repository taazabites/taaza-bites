import { HealthAssessment } from "../firebase/collections";

export const getMealWarnings = (mealIngredients: string[], assessment: HealthAssessment | null): string[] => {
  if (!assessment || !mealIngredients) return [];
  const warnings: string[] = [];

  const checkOverlap = (list1: string[], list2: string[]) => {
    return list1.some(i => list2.some(j => i.toLowerCase().includes(j.toLowerCase()) || j.toLowerCase().includes(i.toLowerCase())));
  };

  if (assessment.allergies && assessment.allergies.length > 0) {
    if (checkOverlap(mealIngredients, assessment.allergies)) {
      warnings.push("Contains Allergen");
    }
  }

  if (assessment.medicalConditions && assessment.medicalConditions.length > 0) {
    // simplified medical check
    const medicalKeywords = assessment.medicalConditions.map(c => c.toLowerCase());
    if (medicalKeywords.includes("diabetes") && mealIngredients.some(i => i.toLowerCase().includes("sugar") || i.toLowerCase().includes("syrup"))) {
      warnings.push("High Sugar (Diabetes Risk)");
    }
  }

  return warnings;
};
