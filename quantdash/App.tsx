import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { DEFAULT_CONFIG } from './constants';
import { AppConfig } from './types';
import { useAnalytics } from './hooks/useAnalytics';
import { exportData } from './services/api';

function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  // Lift state so we can pass trigger to Sidebar and data to Dashboard
  const analytics = useAnalytics(config);

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        onRunAdf={analytics.triggerAdf}
        loadingAdf={analytics.loadingAdf}
        onExport={() => exportData('csv')}
      />
      <Dashboard 
        config={config} 
        analytics={analytics}
      />
    </div>
  );
}

export default App;