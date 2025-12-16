import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { AnalyticsData } from '../../types';

interface SpreadChartProps {
  data: AnalyticsData[];
  threshold: number;
}

const SpreadChart: React.FC<SpreadChartProps> = ({ data, threshold }) => {
  return (
    <div className="grid grid-rows-2 gap-4 h-full">
      {/* Spread Chart */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-slate-200 font-semibold mb-2">Spread</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="timestamp" hide />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            <Line type="monotone" dataKey="spread" stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Z-Score Chart */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-slate-200 font-semibold mb-2">Z-Score</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              tickFormatter={(val) => new Date(val).toLocaleTimeString()}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[-4, 4]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            
            <ReferenceLine y={threshold} stroke="red" strokeDasharray="3 3" />
            <ReferenceLine y={-threshold} stroke="red" strokeDasharray="3 3" />
            <ReferenceLine y={0} stroke="#94a3b8" />

            <Line type="monotone" dataKey="zScore" stroke="#8b5cf6" dot={false} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpreadChart;
