import React from 'react';
import { AnalyticsData, AdfResult } from '../types';

interface StatsPanelProps {
  data: AnalyticsData | null;
  adfResult: AdfResult | null;
  adfLastRun: Date | null;
}

const StatItem = ({ label, value, isCurrency = false, highlight = false, colorClass = "" }: { 
  label: string; 
  value: string | number | null | undefined; 
  isCurrency?: boolean;
  highlight?: boolean;
  colorClass?: string;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className={`font-mono text-sm ${colorClass || (highlight ? 'text-blue-400' : 'text-slate-100')}`}>
      {value === null || value === undefined
        ? '--' 
        : typeof value === 'number' 
          ? value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4, style: isCurrency ? 'currency' : 'decimal', currency: 'USD' }) 
          : value}
    </span>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ data, adfResult, adfLastRun }) => {
  // Use data or fallback to object with nulls to render the structure
  const safeData = data || {
    symbolA: '---', symbolB: '---',
    priceA: null, priceB: null,
    returnsA: null, returnsB: null,
    hedgeRatio: null, spread: null, zScore: null, correlation: null
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-full overflow-y-auto">
      <h3 className="text-slate-200 font-semibold mb-4 border-b border-slate-600 pb-2">Live Analytics</h3>
      
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Price Statistics</h4>
        <StatItem label={`${safeData.symbolA} Price`} value={safeData.priceA} isCurrency />
        <StatItem label={`${safeData.symbolA} Returns`} value={safeData.returnsA} />
        <StatItem label={`${safeData.symbolB} Price`} value={safeData.priceB} isCurrency />
        <StatItem label={`${safeData.symbolB} Returns`} value={safeData.returnsB} />
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Pairs Trading Metrics</h4>
        <StatItem label="Hedge Ratio" value={safeData.hedgeRatio} highlight />
        <StatItem label="Spread" value={safeData.spread} />
        <StatItem label="Z-Score" value={safeData.zScore} 
          colorClass={safeData.zScore && Math.abs(safeData.zScore as number) > 2 ? 'text-red-400 font-bold' : ''}
        />
        <StatItem label="Correlation" value={safeData.correlation} />
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between items-center">
          <span>ADF Test Result</span>
          {adfLastRun && <span className="text-[10px] text-slate-500 font-normal">{adfLastRun.toLocaleTimeString()}</span>}
        </h4>
        
        {adfResult ? (
          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${adfResult.isStationary ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {adfResult.isStationary ? "STATIONARY" : "NON-STATIONARY"}
              </span>
            </div>
            
            <StatItem 
              label="p-value" 
              value={adfResult.pValue} 
              colorClass={adfResult.pValue < 0.05 ? 'text-emerald-400' : 'text-red-400'} 
            />
            
            <div className="mt-3 pt-2 border-t border-slate-700/50">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Critical Values</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400">
                <div className="text-center">
                  <span className="block text-[10px] text-slate-600">1%</span>
                  {adfResult.criticalValues['1%']?.toFixed(3) || '--'}
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-slate-600">5%</span>
                  {adfResult.criticalValues['5%']?.toFixed(3) || '--'}
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-slate-600">10%</span>
                  {adfResult.criticalValues['10%']?.toFixed(3) || '--'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-900/30 rounded border border-slate-700/50 border-dashed">
            <p className="text-slate-500 text-xs italic mb-1">No test run yet</p>
            <p className="text-slate-600 text-[10px]">Click "Run ADF Test" in sidebar to analyze spread stationarity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;