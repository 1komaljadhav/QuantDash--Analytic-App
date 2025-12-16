import React from 'react';
import PriceChart from './charts/PriceChart';
import SpreadChart from './charts/SpreadChart';
import CorrelationChart from './charts/CorrelationChart';
import StatsPanel from './StatsPanel';
import AlertsPanel from './AlertsPanel';
import { AppConfig, AnalyticsData, Candle, AdfResult } from '../types';

interface DashboardProps {
  config: AppConfig;
  analytics: {
    liveStats: AnalyticsData | null;
    historyA: Candle[];
    historyB: Candle[];
    analyticsHistory: AnalyticsData[];
    adfResult: AdfResult | null;
    adfLastRun: Date | null;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ config, analytics }) => {
  const { 
    liveStats, 
    historyA, 
    historyB, 
    analyticsHistory, 
    adfResult,
    adfLastRun
  } = analytics;

  return (
    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-slate-900">
      {/* Top Row: Alerts & Stats Summary */}
      <div className="grid grid-cols-4 gap-6 h-40 shrink-0">
        <div className="col-span-1">
          <AlertsPanel 
            currentZScore={liveStats?.zScore || 0} 
            threshold={config.zScoreThreshold} 
          />
        </div>
        <div className="col-span-3">
             {/* Placeholder for top ticker or quick stats */}
             <div className="h-full bg-slate-800/50 rounded-lg border border-slate-800 flex items-center justify-center text-slate-600">
                <span className="text-sm font-mono">
                  System Latency: 12ms <span className="mx-2">|</span> 
                  WebSocket: <span className="text-emerald-500">Connected</span> <span className="mx-2">|</span> 
                  Ingest Rate: 45 ticks/sec
                </span>
             </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Charts */}
        <div className="col-span-9 flex flex-col gap-6">
          {/* Fixed height for Price Chart */}
          <div className="h-[450px]">
            <PriceChart 
              dataA={historyA} 
              dataB={historyB} 
              symbolA={config.symbolA} 
              symbolB={config.symbolB} 
            />
          </div>
          {/* Fixed height for bottom charts */}
          <div className="h-[350px] grid grid-cols-2 gap-6">
            <SpreadChart data={analyticsHistory} threshold={config.zScoreThreshold} />
            <CorrelationChart data={analyticsHistory} />
          </div>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="col-span-3">
          <StatsPanel 
            data={liveStats} 
            adfResult={adfResult} 
            adfLastRun={adfLastRun}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;