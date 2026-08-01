const fs = require('fs');

let calendarCode = fs.readFileSync('src/pages/Calendar.tsx', 'utf8');

const oldSkip = `  const handleSkipMeal = async (scheduleId: string) => {
    try {
      await MealService.skipMeal(scheduleId);
      showToast("Meal skipped successfully. It won't be delivered.", "success");
    } catch (err) {
      showToast("Failed to skip meal.", "error");
    }
  };`;

const newSkip = `  const handleSkipMeal = async (scheduleId: string) => {
    if (!currentUser) return;
    try {
      await MealService.skipMeal(scheduleId, currentUser.uid);
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, deliveryStatus: 'skipped' } : s));
      showToast("Meal skipped successfully. ₹350 credited to wallet.", "success");
    } catch (err) {
      showToast("Failed to skip meal.", "error");
    }
  };`;

const oldUnskip = `  const handleUnskipMeal = async (scheduleId: string) => {
    try {
      await MealService.unskipMeal(scheduleId);
      showToast("Meal restored successfully.", "success");
    } catch (err) {
      showToast("Failed to restore meal.", "error");
    }
  };`;

const newUnskip = `  const handleUnskipMeal = async (scheduleId: string) => {
    if (!currentUser) return;
    try {
      await MealService.unskipMeal(scheduleId, currentUser.uid);
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, deliveryStatus: 'pending' } : s));
      showToast("Meal restored successfully. ₹350 debited from wallet.", "success");
    } catch (err) {
      showToast("Failed to restore meal.", "error");
    }
  };`;

calendarCode = calendarCode.replace(oldSkip, newSkip);
calendarCode = calendarCode.replace(oldUnskip, newUnskip);

fs.writeFileSync('src/pages/Calendar.tsx', calendarCode);
console.log('Patched Calendar.tsx');
