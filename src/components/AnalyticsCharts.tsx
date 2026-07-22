import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SignatureRecord } from '../types';
import { TrendingUp, BarChart3, PieChartIcon } from 'lucide-react';

interface AnalyticsChartsProps {
  records: SignatureRecord[];
}

export default function AnalyticsCharts({ records }: AnalyticsChartsProps) {
  // 1. Process Monthly Trend Data (group by month/year from date, or mock if only a few items)
  // Let's create a realistic monthly count. Since we are in July 2026, let's list Jan - July 2026
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const monthlyCounts = monthsList.reduce((acc, m) => {
    acc[m] = 0;
    return acc;
  }, {} as Record<string, number>);

  records.forEach((r) => {
    // extract month
    // dates are like "21 July 2026" or "2026-07-18" or "July 21, 2026"
    const lower = r.signatureDate.toLowerCase();
    let monthFound = 'Jul';
    if (lower.includes('jan')) monthFound = 'Jan';
    else if (lower.includes('feb')) monthFound = 'Feb';
    else if (lower.includes('mar')) monthFound = 'Mar';
    else if (lower.includes('apr')) monthFound = 'Apr';
    else if (lower.includes('may')) monthFound = 'May';
    else if (lower.includes('jun')) monthFound = 'Jun';
    else if (lower.includes('jul')) monthFound = 'Jul';
    else if (r.signatureDate.includes('-01-')) monthFound = 'Jan';
    else if (r.signatureDate.includes('-02-')) monthFound = 'Feb';
    else if (r.signatureDate.includes('-03-')) monthFound = 'Mar';
    else if (r.signatureDate.includes('-04-')) monthFound = 'Apr';
    else if (r.signatureDate.includes('-05-')) monthFound = 'May';
    else if (r.signatureDate.includes('-06-')) monthFound = 'Jun';
    else if (r.signatureDate.includes('-07-')) monthFound = 'Jul';

    monthlyCounts[monthFound] = (monthlyCounts[monthFound] || 0) + 1;
  });

  const trendData = monthsList.map((m) => ({
    name: m,
    signatures: monthlyCounts[m],
  }));

  // 2. Process Department Comparison Data
  const deptMap: Record<string, number> = {};
  records.forEach((r) => {
    const dept = r.department || 'General';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 3. Process Approval Status Data
  const statusMap: Record<string, number> = {
    'Submitted': 0,
    'Under Review': 0,
    'Need Correction': 0,
    'Approved & Signed': 0,
    'Returned to Submitter': 0,
    'Completed': 0,
    'Rejected': 0,
    'Archived': 0,
  };
  records.forEach((r) => {
    if (statusMap[r.signatureStatus] !== undefined) {
      statusMap[r.signatureStatus]++;
    } else {
      statusMap[r.signatureStatus] = 1;
    }
  });

  const statusData = Object.entries(statusMap)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  const COLORS = {
    'Submitted': '#3B82F6',
    'Under Review': '#6366F1',
    'Need Correction': '#F59E0B',
    'Approved & Signed': '#0D9488',
    'Returned to Submitter': '#8B5CF6',
    'Completed': '#10B981',
    'Rejected': '#EF4444',
    'Archived': '#64748B',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Signature Trend (Area Chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              Monthly Signature Trend
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
              Volume Progression 2026
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSignatures" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Area
                type="monotone"
                dataKey="signatures"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSignatures)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Statistics (Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              Department Metrics
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
              Records Count comparison
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={28}>
                {deptData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#3B82F6' : '#6366F1'} // Sky to Indigo
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Approval Status Distribution (Pie Chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              Authorization Ratios
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
              Current Signature Statuses
            </p>
          </div>
        </div>
        <div className="h-64 w-full relative flex items-center justify-center">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-slate-400">No active records found</span>
          )}
        </div>
      </div>
    </div>
  );
}
