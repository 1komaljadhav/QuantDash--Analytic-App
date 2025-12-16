import React from 'react';
import { AVAILABLE_SYMBOLS, TIMEFRAMES } from '../constants';
import { AppConfig } from '../types';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onRunAdf: () => void;
  loadingAdf: boolean;
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onRunAdf, loadingAdf, onExport }) => {
  const handleChange = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col p-4 h-full shrink-0 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-500 tracking-tight">QuantDash</h1>
        <p className="text-slate-500 text-xs mt-1">Real-time Pairs Analytics</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Symbol Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Symbol A (Independent)</label>
          <select 
            value={config.symbolA} 
            onChange={(e) => handleChange('symbolA', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-blue-500 outline-none"
          >
            {AVAILABLE_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label className="text-xs font-bold text-slate-400 uppercase">Symbol B (Dependent)</label>
          <select 
            value={config.symbolB} 
            onChange={(e) => handleChange('symbolB', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-blue-500 outline-none"
          >
            {AVAILABLE_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Resampling Timeframe</label>
          <div className="grid grid-cols-3 gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => handleChange('timeframe', tf.value)}
                className={`text-xs py-1 px-2 rounded border ${
                  config.timeframe === tf.value 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {tf.value}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Window Size</label>
          <input 
            type="number" 
            value={config.windowSize}
            onChange={(e) => handleChange('windowSize', parseInt(e.target.value))}
            className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-blue-500 outline-none"
          />

          <label className="text-xs font-bold text-slate-400 uppercase">Z-Score Threshold</label>
          <input 
            type="number" 
            step="0.1"
            value={config.zScoreThreshold}
            onChange={(e) => handleChange('zScoreThreshold', parseFloat(e.target.value))}
            className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3 border-t border-slate-800">
          <button 
            onClick={onRunAdf}
            disabled={loadingAdf}
            className={`w-full py-2 px-4 rounded font-semibold text-sm transition-colors ${
              loadingAdf 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {loadingAdf ? 'Running...' : 'Run ADF Test'}
          </button>
          
          <button 
            onClick={onExport}
            className="w-full py-2 px-4 rounded font-semibold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Export Data (CSV)
          </button>
        </div>
      </div>
      
     
    </div>
  );
};

export default Sidebar;