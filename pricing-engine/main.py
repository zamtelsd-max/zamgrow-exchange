"""
Zamgrow Exchange - Intelligent Pricing Engine
Python FastAPI microservice with XGBoost price prediction
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import random
from datetime import datetime
from typing import Optional
import os

from models import (
    PriceSuggestionResponse, HeatmapResponse, 
    MarketDataResponse, HealthResponse
)
from pricing import PricingEngine

app = FastAPI(
    title="Zamgrow Exchange Pricing Engine",
    description="AI/ML-powered agricultural price prediction for Zambia",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pricing engine
engine = PricingEngine()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="Zamgrow Pricing Engine",
        version="1.0.0",
        model_status="loaded",
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/pricing/suggest", response_model=PriceSuggestionResponse)
async def get_price_suggestion(
    product_id: str = Query(..., description="Product identifier (e.g. 'maize', 'soya')"),
    province_id: Optional[int] = Query(None, description="Province ID (1-10)"),
    district_id: Optional[int] = Query(None, description="District ID"),
    quantity_kg: Optional[float] = Query(None, description="Quantity in kg"),
    month: Optional[int] = Query(None, description="Month (1-12), defaults to current"),
):
    """
    Get AI-powered price suggestion for an agricultural commodity.
    
    Uses XGBoost regression trained on historical transaction data,
    with seasonal adjustments and province-specific factors.
    """
    current_month = month or datetime.now().month
    
    suggestion = engine.predict(
        product_id=product_id,
        province_id=province_id or 5,  # Default: Lusaka
        district_id=district_id,
        quantity_kg=quantity_kg,
        month=current_month,
    )
    
    return suggestion

@app.get("/pricing/heatmap")
async def get_price_heatmap(
    product_id: str = Query(..., description="Product identifier"),
):
    """
    Get province-level price heatmap data for visualization.
    Returns intensity values (0-1) and average prices for all 10 provinces.
    """
    heatmap = engine.get_heatmap(product_id)
    return {"success": True, "data": heatmap}

@app.get("/pricing/market")
async def get_market_overview(
    province_id: Optional[int] = Query(None),
):
    """Get market overview with all major commodities"""
    data = engine.get_market_overview(province_id)
    return {"success": True, "data": data}

@app.get("/pricing/history/{product_id}")
async def get_price_history(
    product_id: str,
    province_id: Optional[int] = Query(None),
    months: int = Query(6, ge=1, le=24),
):
    """Get historical price data for trend charts"""
    history = engine.get_price_history(product_id, province_id, months)
    return {"success": True, "data": history}

@app.post("/pricing/retrain")
async def trigger_retraining():
    """Trigger model retraining (admin endpoint, normally scheduled weekly)"""
    # In production: fetch new data from PostgreSQL and retrain XGBoost model
    return {
        "success": True,
        "message": "Model retraining initiated",
        "scheduled": "Sunday 02:00 CAT"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
