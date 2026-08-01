import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HealthProgressService, DailyCheckInService } from '../firebase/services';
import { Card, Button } from '../components/ui/primitives';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Droplets, Moon, Zap, Plus } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function NutritionDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any[]>([]);
  const [recentCheckIn, setRecentCheckIn] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchData = async () => {
      const prog = await HealthProgressService.getProgress(currentUser.uid);
      // Sort progress by date for the chart
      const sortedProg = [...prog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setProgress(sortedProg);
      
      const checkIns = await DailyCheckInService.getCheckIns(currentUser.uid);
      setRecentCheckIn(checkIns[0] || null);
    };
    fetchData();
  }, [currentUser]);

  const latest = progress[progress.length - 1] || {};

  return (
    <div className="p-6 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">AI Nutrition Dashboard</h1>
        <Button onClick={() => navigate('/daily-check-in')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Daily Check-in
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-white border-zinc-100 shadow-sm">
          <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Current Weight</p>
          <p className="text-3xl font-black">{latest.weight || '--'} <span className="text-sm font-medium">kg</span></p>
        </Card>
        <Card className="p-6 bg-white border-zinc-100 shadow-sm">
          <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">BMI</p>
          <p className="text-3xl font-black">{latest.bmi || '--'}</p>
        </Card>
        <Card className="p-6 bg-white border-zinc-100 shadow-sm">
          <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Body Fat %</p>
          <p className="text-3xl font-black">{latest.bodyFat || '--'} <span className="text-sm font-medium">%</span></p>
        </Card>
        <Card className="p-6 bg-white border-zinc-100 shadow-sm">
          <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Goal Status</p>
          <p className="text-lg font-black text-emerald-600">On Track</p>
        </Card>
      </div>

      {recentCheckIn && (
        <Card className="p-6 mb-8 border-emerald-100 bg-emerald-50/30">
          <h3 className="text-sm font-black text-emerald-900 mb-4 uppercase tracking-widest">Today's Log</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="font-bold">{recentCheckIn.waterIntake}ml</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="font-bold">{recentCheckIn.sleepHours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-bold">{recentCheckIn.energyLevel}/10</span>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-8 border-zinc-100 shadow-sm">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <TrendingUp className="text-emerald-500" /> Weight Trend
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
