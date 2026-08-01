export const calculateBMI = (weight: number, height: number) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export const calculateNutrition = (
  gender: string,
  age: number,
  height: number,
  weight: number,
  activityLevel: string,
  goal: string
) => {
  // BMR (Mifflin-St Jeor Equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity Multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    athlete: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = bmr * multiplier;

  // Goal Adjustment
  let recommendedCalories = tdee;
  let proteinPerKg = 1.2;

  switch (goal) {
    case "weightLoss":
    case "fatLoss":
      recommendedCalories -= 500;
      proteinPerKg = 1.6;
      break;
    case "muscleGain":
    case "weightGain":
      recommendedCalories += 300;
      proteinPerKg = 2.0;
      break;
    case "maintenance":
    case "healthyEating":
      proteinPerKg = 1.4;
      break;
  }

  const recommendedProtein = weight * proteinPerKg;
  const recommendedWater = weight * 0.033; // 33ml per kg

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommendedCalories: Math.round(recommendedCalories),
    recommendedProtein: Math.round(recommendedProtein),
    recommendedWater: parseFloat(recommendedWater.toFixed(1)),
  };
};
