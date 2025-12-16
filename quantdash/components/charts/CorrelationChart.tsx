import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AnalyticsData } from '../../types';

interface CorrelationChartProps {
  data: AnalyticsData[];
}

const CorrelationChart: React.FC<CorrelationChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-slate-200 font-semibold mb-2">Rolling Correlation</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            tickFormatter={(val) => new Date(val).toLocaleTimeString()}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[-1, 1]} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
          <Line type="monotone" dataKey="correlation" stroke="#ec4899" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
