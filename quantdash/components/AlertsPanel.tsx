import React, { useMemo } from 'react';
import { AnalyticsData } from '../types';

interface AlertsPanelProps {
  currentZScore: number;
  threshold: number;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ currentZScore, threshold }) => {
  // Simple client-side alert logic for visualization
  const alertStatus = useMemo(() => {
    if (Math.abs(currentZScore) > threshold) {
      return {
        active: true,
        type: 'critical',
        message: `Z-Score Breakout: ${currentZScore.toFixed(2)} exceeds threshold ${threshold}`,
      };
    }
    if (Math.abs(currentZScore) > threshold * 0.8) {
      return {
        active: true,
        type: 'warning',
        message: `Z-Score Approaching: ${currentZScore.toFixed(2)} (80% of threshold)`,
      };
    }
    return { active: false, type: 'info', message: 'Market Normal' };
  }, [currentZScore, threshold]);

  return (
    <div className={`rounded-lg border p-3 flex items-start gap-3 transition-colors ${
      alertStatus.type === 'critical' ? 'bg-red-900/20 border-red-800' :
      alertStatus.type === 'warning' ? 'bg-amber-900/20 border-amber-800' :
      'bg-slate-800 border-slate-700'
    }`}>
      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
        alertStatus.type === 'critical' ? 'bg-red-500 animate-pulse' :
        alertStatus.type === 'warning' ? 'bg-amber-500' :
        'bg-blue-500'
      }`} />
      <div>
        <h4 className={`text-sm font-bold ${
          alertStatus.type === 'critical' ? 'text-red-400' :
          alertStatus.type === 'warning' ? 'text-amber-400' :
          'text-blue-400'
        }`}>
          {alertStatus.type === 'critical' ? 'ALERT TRIGGERED' : 'SYSTEM STATUS'}
        </h4>
        <p className="text-xs text-slate-300 mt-1">{alertStatus.message}</p>
      </div>
    </div>
  );
};

export default AlertsPanel;
