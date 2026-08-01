import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { Clock, ShieldAlert } from "lucide-react";

export const ActivityTimelineChart = ({ data }: { data: any[] }) => (
  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold tracking-wide text-zinc-200 flex items-center gap-2">
        <Clock className="h-4 w-4 text-emerald-500" />
        Infrastructure Traffic Timeline (7 Days)
      </h3>
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="Actions" stroke="#10b981" fillOpacity={1} fill="url(#colorActions)" strokeWidth={2} />
          <Area type="monotone" dataKey="Logins" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLogins)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const ThreatSeverityMatrix = ({ data, colors }: { data: any[], colors: string[] }) => (
  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-zinc-200 flex items-center gap-2 mb-4">
        <ShieldAlert className="h-4 w-4 text-red-500" />
        Threat Severity Matrix
      </h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-zinc-500 text-xs">
          No active threats logged. Clean health record.
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-zinc-400 mt-2">
      {data.map((e, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: colors[i % colors.length] }}></span>
            {e.name}
          </span>
          <span className="font-bold text-white mt-0.5">{e.value}</span>
        </div>
      ))}
    </div>
  </div>
);
