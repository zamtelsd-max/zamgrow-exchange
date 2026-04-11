"""
Zamgrow Exchange - Pricing Engine (FastAPI)
Mock ML-powered agricultural price intelligence service
"""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
import random

from models import (
    PriceSuggestion,
    HeatmapPoint,
    PriceHistoryResponse,
    HealthResponse,
)
from pricing import (
    calculate_price_suggestion,
    calculate_heatmap,
    generate_price_history,
    BASE_PRICES,
)

app = FastAPI(
    title="Zamgrow Pricing Engine",
    description="AI-powered agricultural commodity pricing for Zambia",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        service="zamgrow-pricing-engine",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
    )


@app.get("/pricing/suggest", response_model=PriceSuggestion)
async def get_price_suggestion(
    product_id: str = Query(..., description="Product name e.g. 'Maize'"),
    province_id: str = Query("all", description="Province name or 'all'"),
    quantity_kg: float = Query(100.0, description="Quantity in kg", gt=0),
):
    """
    Get AI-powered price suggestion for a product.
    Returns min, avg, max prices with confidence score and trend.
    """
    if product_id not in BASE_PRICES:
        raise HTTPException(
            status_code=404,
            detail=f"Product '{product_id}' not found. Available: {list(BASE_PRICES.keys())}"
        )
    return calculate_price_suggestion(product_id, province_id, quantity_kg)


@app.get("/pricing/heatmap", response_model=List[HeatmapPoint])
async def get_heatmap(
    product_id: str = Query("Maize", description="Product name"),
):
    """
    Get province-level price heatmap data for visualization.
    Returns avg prices, listing counts, and price changes per province.
    """
    return calculate_heatmap(product_id)


@app.get("/pricing/history", response_model=PriceHistoryResponse)
async def get_price_history(
    product_id: str = Query(..., description="Product name"),
    province: str = Query("all", description="Province or 'all'"),
    days: int = Query(180, description="Number of days of history", ge=7, le=365),
):
    """
    Get historical price data for charting.
    Returns weekly price and volume data points.
    """
    if product_id not in BASE_PRICES:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    data = generate_price_history(product_id, province, days)
    return PriceHistoryResponse(product=product_id, province=province, data=data)


@app.get("/pricing/products")
async def list_products():
    """List all available products with base price info"""
    return [
        {
            "name": name,
            "base_price": data["base"],
            "unit": data["unit"],
            "trend": data["trend"],
        }
        for name, data in BASE_PRICES.items()
    ]


@app.get("/pricing/market-summary")
async def market_summary():
    """Get overall market summary with top movers"""
    products = []
    for name, data in list(BASE_PRICES.items())[:10]:
        price_change = round(random.uniform(-8, 12), 1)
        products.append({
            "product": name,
            "current_price": data["base"],
            "unit": data["unit"],
            "price_change_7d": price_change,
            "trend": data["trend"],
            "volume_index": random.randint(50, 200),
        })
    
    return {
        "summary": products,
        "market_sentiment": "bullish",
        "top_gainer": max(products, key=lambda x: x["price_change_7d"])["product"],
        "top_loser": min(products, key=lambda x: x["price_change_7d"])["product"],
        "generated_at": datetime.now().isoformat(),
    }
