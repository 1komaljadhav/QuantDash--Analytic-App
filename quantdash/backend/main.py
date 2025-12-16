import asyncio
import json
from typing import Dict, List

import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.tsa.stattools import adfuller

from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from websockets import connect
import requests
from fastapi.responses import StreamingResponse

# =============================
# App setup
# =============================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================
# Price storage (ticks)
# =============================
price_data: Dict[str, pd.Series] = {}
MAX_POINTS = 3000

# =============================
# Historical preload
# =============================
def preload_history(symbol: str, limit: int = 1000):
    url = "https://api.binance.com/api/v3/klines"
    params = {"symbol": symbol, "interval": "1s", "limit": limit}
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()

    series = pd.Series(
        {pd.to_datetime(k[0], unit="ms"): float(k[4]) for k in r.json()}
    ).sort_index()

    price_data[symbol] = series

# =============================
# Binance WebSocket
# =============================
async def binance_ws(symbol: str):
    url = f"wss://stream.binance.com:9443/ws/{symbol.lower()}@trade"
    while True:
        try:
            async with connect(url) as ws:
                async for msg in ws:
                    d = json.loads(msg)
                    ts = pd.to_datetime(d["T"], unit="ms")
                    px = float(d["p"])

                    s = price_data.get(symbol, pd.Series(dtype=float))
                    s.loc[ts] = px
                    price_data[symbol] = s.iloc[-MAX_POINTS:]
        except Exception as e:
            print(f"WS error {symbol}: {e}")
            await asyncio.sleep(5)

# =============================
# Startup
# =============================
@app.on_event("startup")
async def startup():
    for sym in ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT"]:
        preload_history(sym)
        asyncio.create_task(binance_ws(sym))

# =============================
# /resampled  (Candle[])
# =============================
@app.get("/resampled")
def resampled(symbol: str, timeframe: str = "1m"):
    if symbol not in price_data:
        return []

    rule = {"1m": "1min", "5m": "5min"}.get(timeframe, "1min")

    ohlc = (
        price_data[symbol]
        .resample(rule)
        .ohlc()
        .dropna()
        .tail(60)
    )

    candles = [
        {
            "timestamp": idx.isoformat(),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
        }
        for idx, row in ohlc.iterrows()
    ]

    return candles

# =============================
# /analytics (MATCHES FRONTEND)
# =============================
@app.get("/analytics")
def analytics(symbolA: str, symbolB: str, window: int = 20):
    if symbolA not in price_data or symbolB not in price_data:
        return {"status": "warming_up"}

    df = pd.concat(
        [price_data[symbolA], price_data[symbolB]], axis=1
    ).dropna()

    if len(df) < window:
        return {"status": "warming_up"}

    df.columns = ["A", "B"]

    # Prices
    priceA = float(df["A"].iloc[-1])
    priceB = float(df["B"].iloc[-1])

    # Returns
    retA = df["A"].pct_change().dropna()
    retB = df["B"].pct_change().dropna()

    # Stats
    meanA, stdA = float(retA.mean()), float(retA.std())
    meanB, stdB = float(retB.mean()), float(retB.std())

    # Hedge ratio
    X = sm.add_constant(df["B"])
    hedge = float(sm.OLS(df["A"], X).fit().params["B"])

    spread = df["A"] - hedge * df["B"]
    zscore = float(
        (spread.iloc[-1] - spread.rolling(window).mean().iloc[-1]) /
        spread.rolling(window).std().iloc[-1]
    )

    correlation = float(retA.corr(retB))

    return {
        "symbolA": symbolA,
        "symbolB": symbolB,
        "priceA": priceA,
        "priceB": priceB,
        "meanA": meanA,
        "stdA": stdA,
        "returnsA": float(retA.iloc[-1]),
        "meanB": meanB,
        "stdB": stdB,
        "returnsB": float(retB.iloc[-1]),
        "hedgeRatio": hedge,
        "spread": float(spread.iloc[-1]),
        "zScore": zscore,
        "correlation": correlation,
        "timestamp": int(pd.Timestamp.utcnow().timestamp() * 1000),
    }

# =============================
# /adf_test (POST)
# =============================
@app.post("/adf_test")
def adf_test(payload: dict = Body(...)):
    symbolA = payload["symbolA"]
    symbolB = payload["symbolB"]

    df = pd.concat(
        [price_data[symbolA], price_data[symbolB]], axis=1
    ).dropna()

    X = sm.add_constant(df.iloc[:, 1])
    hedge = sm.OLS(df.iloc[:, 0], X).fit().params[1]
    spread = df.iloc[:, 0] - hedge * df.iloc[:, 1]

    stat, pval, _, _, crit, _ = adfuller(spread)

    return {
        "pValue": float(pval),
        "isStationary": bool(pval < 0.05),
        "criticalValues": {k: float(v) for k, v in crit.items()},
    }

# =============================
# /export
# =============================
@app.get("/export")
def export(format: str = "csv"):
    df = pd.DataFrame(price_data)

    if format == "json":
        return df.to_dict()

    def stream():
        yield df.to_csv()

    return StreamingResponse(stream(), media_type="text/csv")
