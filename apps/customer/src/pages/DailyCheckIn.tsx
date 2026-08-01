import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DailyCheckInService } from '../firebase/services';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui/primitives';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

export default function DailyCheckInPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    weight: '',
    energyLevel: 5,
    mood: 'Neutral',
    sleepHours: 7,
    waterIntake: 2000,
    workoutMinutes: 30
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await DailyCheckInService.addCheckIn(currentUser.uid, {
        userId: currentUser.uid,
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: Number(formData.weight),
        energyLevel: Number(formData.energyLevel),
        mood: formData.mood,
        sleepHours: Number(formData.sleepHours),
        waterIntake: Number(formData.waterIntake),
        workoutMinutes: Number(formData.workoutMinutes)
      });
      showToast('Check-in saved successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Failed to save check-in.', 'error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Daily Check-in</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input type="number" step="0.1" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Energy Level (1-10)</label>
            <input type="range" min="1" max="10" value={formData.energyLevel} onChange={e => setFormData({...formData, energyLevel: Number(e.target.value)})} className="w-full" />
            <span>{formData.energyLevel}</span>
          </div>
          <div>
            <label className="block text-sm font-medium">Mood</label>
            <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})} className="w-full p-2 border rounded">
              <option>Happy</option>
              <option>Neutral</option>
              <option>Tired</option>
              <option>Stressed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Sleep Hours</label>
            <input type="number" value={formData.sleepHours} onChange={e => setFormData({...formData, sleepHours: Number(e.target.value)})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Water Intake (ml)</label>
            <input type="number" value={formData.waterIntake} onChange={e => setFormData({...formData, waterIntake: Number(e.target.value)})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Workout Minutes</label>
            <input type="number" value={formData.workoutMinutes} onChange={e => setFormData({...formData, workoutMinutes: Number(e.target.value)})} className="w-full p-2 border rounded" />
          </div>
          <Button type="submit">Submit Check-in</Button>
        </form>
      </Card>
    </div>
  );
}
