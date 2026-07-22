import React from 'react';
import { Files, Clock, CheckCircle2, Award, Activity } from 'lucide-react';
import { SignatureRecord } from '../types';

interface StatsGridProps {
  records: SignatureRecord[];
}

export default function StatsGrid({ records }: StatsGridProps) {
  const total = records.length;
  const pending = records.filter((r) => r.signatureStatus === 'Submitted' || r.signatureStatus === 'Under Review' || r.signatureStatus === 'Need Correction').length;
  const completed = records.filter((r) => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length;
  
  // Calculate a mock accuracy that is slightly dynamic based on record volume
  const accuracy = total > 0 ? (98.4 - (records.filter(r => r.signatureStatus === 'Rejected').length * 0.2)).toFixed(1) : '98.4';

  const stats = [
    {
      title: 'Total Records',
      value: total,
      desc: '↑ 12% vs last month',
      descColor: 'text-green-600 dark:text-green-400',
      icon: Files,
      color: 'text-slate-700 dark:text-slate-300',
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
    },
    {
      title: 'Pending Approval',
      value: pending,
      desc: 'Requires immediate review',
      descColor: 'text-slate-500 dark:text-slate-400',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-500',
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
    },
    {
      title: 'Completed',
      value: completed,
      desc: 'Verified & Securely Stored',
      descColor: 'text-slate-500 dark:text-slate-400',
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-500',
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
    },
    {
      title: 'AI Accuracy',
      value: `${accuracy}%`,
      desc: 'Voice-to-Text performance',
      descColor: 'text-slate-500 dark:text-slate-400',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-500',
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-5 border ${stat.border} ${stat.bg} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color === 'text-slate-700 dark:text-slate-300' ? 'text-slate-900 dark:text-white' : stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className={`mt-2 text-xs font-medium ${stat.descColor}`}>
              {stat.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
