import { Helmet } from 'react-helmet-async';
import EnhancedDashboard from '../components/dashboard/EnhancedDashboard';

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <Helmet>
        <title>Performance Dashboard | TaazaBites</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">System Performance</h1>
            <p className="text-slate-500 font-medium">Real-time overview of TaazaBites operational excellence and growth metrics.</p>
        </div>

        <EnhancedDashboard />
      </div>
    </div>
  );
}
