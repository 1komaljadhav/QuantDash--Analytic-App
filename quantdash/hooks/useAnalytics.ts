import { useState, useEffect, useCallback } from 'react';
import { fetchAnalytics, fetchResampled, runAdfTest } from '../services/api';
import { AnalyticsData, Candle, AdfResult, AppConfig } from '../types';
import { REFRESH_RATE_MS, CHART_REFRESH_RATE_MS } from '../constants';

export const useAnalytics = (config: AppConfig) => {
  const [liveStats, setLiveStats] = useState<AnalyticsData | null>(null);
  const [historyA, setHistoryA] = useState<Candle[]>([]);
  const [historyB, setHistoryB] = useState<Candle[]>([]);
  const [adfResult, setAdfResult] = useState<AdfResult | null>(null);
  const [adfLastRun, setAdfLastRun] = useState<Date | null>(null);
  const [loadingAdf, setLoadingAdf] = useState(false);
  
  // Historical data for charts (Z-Score, Correlation need history)
  const [analyticsHistory, setAnalyticsHistory] = useState<AnalyticsData[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAnalytics(config.symbolA, config.symbolB, config.windowSize);
      
      // Handle warming up (data might be null if backend has no ticks yet)
      if (data) {
        setLiveStats(data);
        setAnalyticsHistory(prev => {
          const newVal = [...prev, data];
          if (newVal.length > 100) newVal.shift(); // Keep last 100 points
          return newVal;
        });
      }
    } catch (error) {
      // Backend likely offline or error
    }
  }, [config.symbolA, config.symbolB, config.windowSize]);

  const fetchCandles = useCallback(async () => {
    try {
      const [dataA, dataB] = await Promise.all([
        fetchResampled(config.symbolA, config.timeframe),
        fetchResampled(config.symbolB, config.timeframe),
      ]);
      setHistoryA(dataA);
      setHistoryB(dataB);
    } catch (error) {
      console.error("Failed to fetch candles", error);
    }
  }, [config.symbolA, config.symbolB, config.timeframe]);

  const triggerAdf = async () => {
    setLoadingAdf(true);
    try {
      const res = await runAdfTest(config.symbolA, config.symbolB);
      setAdfResult(res);
      setAdfLastRun(new Date());
    } catch (e) {
      console.error(e);
      alert("ADF Test failed. Ensure enough data is buffered (needs ~30 seconds of run time).");
    } finally {
      setLoadingAdf(false);
    }
  };

  // Polling for live stats
  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, REFRESH_RATE_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Polling for candles
  useEffect(() => {
    fetchCandles();
    const interval = setInterval(fetchCandles, CHART_REFRESH_RATE_MS);
    return () => clearInterval(interval);
  }, [fetchCandles]);

  // Reset history on symbol change
  useEffect(() => {
    setAnalyticsHistory([]);
    setAdfResult(null);
    setAdfLastRun(null);
  }, [config.symbolA, config.symbolB]);

  return {
    liveStats,
    historyA,
    historyB,
    analyticsHistory,
    adfResult,
    adfLastRun,
    triggerAdf,
    loadingAdf
  };
};