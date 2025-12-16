import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { AnalyticsData, AdfResult, Candle } from '../types';

// Set to TRUE to use mock data for demonstration purposes
const USE_MOCK = false; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// --- MOCK DATA STATE ---
// Keep track of prices to simulate a random walk
const mockState: Record<string, number> = {
  'BTCUSDT': 64230.00,
  'ETHUSDT': 3450.00,
  'SOLUSDT': 145.00,
  'BNBUSDT': 590.00,
  'ADAUSDT': 0.45
};

// Generate realistic looking candles history
const generateMockCandles = (symbol: string, count: number): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = mockState[symbol] || 100;
  // Start 'count' minutes ago
  const now = Date.now();
  const intervalMs = 60000; 

  // We want the *last* candle to match the current mockState price roughly
  // So let's generate backwards then reverse, or generate from a start point.
  // Let's walk backwards from current price.
  
  for (let i = 0; i < count; i++) {
    const time = now - i * intervalMs;
    const volatility = currentPrice * 0.0005; // 0.05% volatility per bar
    const change = (Math.random() - 0.5) * volatility * 2;
    
    const close = currentPrice;
    const open = currentPrice - change; // approximated
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    candles.push({
      timestamp: new Date(time).toISOString(),
      open,
      high,
      low,
      close
    });

    // Update 'currentPrice' for the *previous* candle in time (walking backwards)
    currentPrice = open; 
  }
  return candles.reverse();
};

const generateMockAnalytics = (symbolA: string, symbolB: string): AnalyticsData => {
  // Update mock prices with random walk
  const updatePrice = (px: number) => px * (1 + (Math.random() - 0.5) * 0.001);
  mockState[symbolA] = updatePrice(mockState[symbolA] || 100);
  mockState[symbolB] = updatePrice(mockState[symbolB] || 100);

  const priceA = mockState[symbolA];
  const priceB = mockState[symbolB];
  
  // Fake calculated metrics
  // Hedge ratio roughly PriceA / PriceB for crypto pairs often
  const hedgeRatio = priceA / priceB; 
  // Spread = A - H * B. If H is exactly A/B, spread is 0. 
  // Let's add noise to H to make spread interesting.
  const noisyHedge = hedgeRatio * (1 + (Math.sin(Date.now() / 10000) * 0.01)); 
  const spread = priceA - (noisyHedge * priceB);
  
  // ZScore oscillating
  const zScore = Math.sin(Date.now() / 5000) * 2.5 + (Math.random() - 0.5); 
  
  return {
    symbolA,
    symbolB,
    priceA,
    priceB,
    meanA: priceA * 0.99,
    stdA: priceA * 0.01,
    returnsA: (Math.random() - 0.5) * 0.01,
    meanB: priceB * 0.99,
    stdB: priceB * 0.01,
    returnsB: (Math.random() - 0.5) * 0.01,
    hedgeRatio: noisyHedge,
    spread,
    zScore,
    correlation: 0.85 + (Math.sin(Date.now() / 20000) * 0.1), // 0.75 to 0.95
    timestamp: Date.now(),
  };
};

// --- API METHODS ---

export const fetchAnalytics = async (
  symbolA: string, 
  symbolB: string, 
  windowSize: number
): Promise<AnalyticsData> => {
  if (USE_MOCK) {
     return new Promise(resolve => {
        setTimeout(() => resolve(generateMockAnalytics(symbolA, symbolB)), 200);
     });
  }
  
  try {
    const response = await api.get('/analytics', {
      params: { symbolA, symbolB, window: windowSize },
    });
    if (response.data.status === 'warming_up') {
      return null as any; 
    }
    return response.data;
  } catch (error) {
    console.error("API Error fetchAnalytics:", error);
    throw error;
  }
};

export const fetchResampled = async (
  symbol: string, 
  timeframe: string
): Promise<Candle[]> => {
  if (USE_MOCK) {
    return new Promise(resolve => {
       // Generate 60 candles
       setTimeout(() => resolve(generateMockCandles(symbol, 60)), 100);
    });
  }

  try {
    const response = await api.get('/resampled', {
      params: { symbol, timeframe },
    });
    return response.data;
  } catch (error) {
    console.error("API Error fetchResampled:", error);
    return [];
  }
};

export const runAdfTest = async (symbolA: string, symbolB: string): Promise<AdfResult> => {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        // Randomly succeed or fail stationarity for demo
        const isStationary = Math.random() > 0.3; 
        resolve({
          pValue: isStationary ? 0.03 : 0.15,
          isStationary,
          criticalValues: {
            '1%': -3.43,
            '5%': -2.86,
            '10%': -2.57
          }
        });
      }, 1500); // 1.5s simulated delay
    });
  }

  try {
    const response = await api.post('/adf_test', { symbolA, symbolB });
    return response.data;
  } catch (error) {
    console.error("API Error runAdfTest:", error);
    throw error;
  }
};

export const exportData = async (format: 'csv' | 'json') => {
  if (USE_MOCK) {
    alert("In Mock Mode: Simulated export would download 'data.csv' here.");
    return;
  }
  window.open(`${API_BASE_URL}/export?format=${format}`, '_blank');
};
