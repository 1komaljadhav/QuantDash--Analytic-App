import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Candle } from '../../types';

interface PriceChartProps {
  dataA: Candle[];
  dataB: Candle[];
  symbolA: string;
  symbolB: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ dataA, dataB, symbolA, symbolB }) => {
  // Merge data based on index or timestamp for simplicity in this prototype
  // Assuming strict time alignment from backend/mock for now
  const mergedData = dataA.map((d, i) => ({
    timestamp: d.timestamp,
    [symbolA]: d.close,
    [symbolB]: dataB[i]?.close,
  }));

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-slate-200 font-semibold mb-2">Price Action (Normalized View)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            tickFormatter={(val) => new Date(val).toLocaleTimeString()}
          />
          <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey={symbolA} stroke="#3b82f6" dot={false} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey={symbolB} stroke="#10b981" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
