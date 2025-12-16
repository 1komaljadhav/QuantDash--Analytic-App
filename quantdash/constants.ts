import { AppConfig } from './types';

export const API_BASE_URL = 'http://localhost:8000';

export const TIMEFRAMES = [
  { value: '1s', label: '1 Second' },
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
];

export const AVAILABLE_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ADAUSDT'
];

export const DEFAULT_CONFIG: AppConfig = {
  symbolA: 'BTCUSDT',
  symbolB: 'ETHUSDT',
  timeframe: '1m',
  windowSize: 20,
  zScoreThreshold: 2.0,
};

export const REFRESH_RATE_MS = 500; // Live analytics update rate
export const CHART_REFRESH_RATE_MS = 2000; // Chart history update rate