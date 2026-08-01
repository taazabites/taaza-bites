import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AIDashboardData {
  todayPrediction: string;
  tomorrowSalesForecast: number;
  nextWeekDemand: number;
  ingredientForecast: string;
  kitchenLoadPrediction: number;
  deliveryLoadPrediction: number;
  subscriptionChurnPrediction: number;
  customerRetentionPrediction: number;
}

export const aiService = {
  async getAIDashboardData(): Promise<AIDashboardData> {
    // In a real scenario, this would call a cloud function or a prediction service.
    // For now, we fetch from a 'aiPredictions' collection.
    const snapshot = await getDocs(query(collection(db, 'aiPredictions'), orderBy('timestamp', 'desc'), limit(1)));
    if (snapshot.empty) {
      return {
        todayPrediction: "High demand expected",
        tomorrowSalesForecast: 450,
        nextWeekDemand: 3000,
        ingredientForecast: "Low stock for Quinoa",
        kitchenLoadPrediction: 85,
        deliveryLoadPrediction: 70,
        subscriptionChurnPrediction: 5,
        customerRetentionPrediction: 92
      };
    }
    return snapshot.docs[0].data() as AIDashboardData;
  }
};
