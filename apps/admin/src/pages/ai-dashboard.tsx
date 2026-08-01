import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { aiService, AIDashboardData } from '../services/ai';
import { BrainCircuit, TrendingUp, AlertCircle, Zap } from 'lucide-react';

export default function AIDashboardPage() {
  const [data, setData] = useState<AIDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService.getAIDashboardData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white">Loading AI Insights...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <BrainCircuit className="h-8 w-8 text-indigo-500" />
        AI Insights Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Tomorrow Sales Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data?.tomorrowSalesForecast} Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Kitchen Load Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data?.kitchenLoadPrediction}%</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Churn Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data?.subscriptionChurnPrediction}%</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Retention Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data?.customerRetentionPrediction}%</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="text-amber-500" /> Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300">{data?.ingredientForecast}</p>
        </CardContent>
      </Card>
    </div>
  );
}
