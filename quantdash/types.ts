export interface MarketTick {
  timestamp: number;
  symbol: string;
  price: number;
}

export interface Candle {
  timestamp: string; // ISO string or formatted time
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface AnalyticsData {
  symbolA: string;
  symbolB: string;
  priceA: number;
  priceB: number;
  meanA: number;
  stdA: number;
  returnsA: number;
  meanB: number;
  stdB: number;
  returnsB: number;
  hedgeRatio: number;
  spread: number;
  zScore: number;
  correlation: number;
  timestamp: number;
}

export interface AdfResult {
  pValue: number;
  isStationary: boolean;
  criticalValues: Record<string, number>;
}

export interface Alert {
  id: string;
  timestamp: number;
  message: string;
  type: 'warning' | 'info' | 'critical';
}

export interface AppConfig {
  symbolA: string;
  symbolB: string;
  timeframe: '1s' | '1m' | '5m';
  windowSize: number;
  zScoreThreshold: number;
}
