# QuantDash - Real-Time Crypto Analytics

This is the Frontend component of the QuantDash real-time trading analytics system.

## Architecture Overview

The system follows a decoupled client-server architecture:

1.  **Backend (Python/FastAPI)**:
    *   **Ingestion**: Connects to Binance WebSocket to receive trade ticks.
    *   **Storage**: Stores raw ticks in SQLite and maintains an in-memory buffer for real-time calculation.
    *   **Analytics Engine**: Calculates simple moving averages, standard deviations, hedge ratios (OLS), and Z-Scores every 500ms.
    *   **API**: Exposes REST endpoints for the frontend to consume.

2.  **Frontend (React/TypeScript)**:
    *   **Data Fetching**: Polls the backend for calculated analytics and resampled candle data.
    *   **Visualization**: Uses Recharts to render real-time Price, Spread, and Correlation charts.
    *   **Alerting**: Compares the received Z-Score against user-defined thresholds to display alerts.

## Backend API Specification

The frontend expects the backend to be running at `http://localhost:8000` with the following endpoints:

*   `GET /resampled`: Returns OHLCV candles.
    *   Params: `symbol` (str), `timeframe` (1s, 1m, 5m)
*   `GET /analytics`: Returns calculated metrics.
    *   Params: `symbolA`, `symbolB`, `window`
    *   Response: `{ priceA, priceB, spread, zScore, correlation, hedgeRatio, ... }`
*   `POST /adf_test`: Triggers an Augmented Dickey-Fuller test on the current spread history.
    *   Body: `{ symbolA, symbolB }`
    *   Response: `{ pValue, isStationary, criticalValues }`
*   `GET /export`: Downloads CSV of current dataset.

## Simulation Mode

By default, the `services/api.ts` file has `USE_MOCK = true`. This allows the frontend to demonstrate functionality (charts, alerts, updates) **without** the Python backend running.

To connect to a real backend:
1.  Open `src/services/api.ts`.
2.  Set `const USE_MOCK = false;`.
3.  Ensure your Python backend is running on Port 8000.

## How to Run (Frontend)

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm start
    ```
3.  Open [http://localhost:3000](http://localhost:3000).

## Analytics Concepts

*   **Hedge Ratio**: The ratio of Symbol B needed to hedge Symbol A to create a market-neutral portfolio, calculated via OLS regression.
*   **Spread**: The difference in price between the two assets, adjusted by the hedge ratio: $Spread = Price_A - (HedgeRatio \times Price_B)$.
*   **Z-Score**: Measures how many standard deviations the current spread is from its mean. Used to identify mean-reversion opportunities.
*   **Rolling Correlation**: Measures how closely the two assets move together over the defined window.
*   **ADF Test**: A statistical test to check if the spread is "stationary" (i.e., tends to revert to the mean), which is a prerequisite for pairs trading.
