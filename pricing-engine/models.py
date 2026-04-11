"""Pydantic models for Zamgrow Pricing Engine"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PriceSuggestionResponse(BaseModel):
    product_id: str
    product_name: str
    province_id: int
    province_name: str
    suggested_price: float = Field(description="AI-recommended price in ZMW")
    avg_market_price: float
    lowest_price: float
    highest_price: float
    confidence_score: float = Field(ge=0, le=1)
    data_points: int
    currency: str = "ZMW"
    unit: str
    trend: str = Field(description="UP | DOWN | STABLE")
    change_percent: float
    last_updated: str
    model_version: str = "1.0.0"


class HeatmapProvinceData(BaseModel):
    province_id: int
    province_name: str
    avg_price: float
    min_price: float
    max_price: float
    listing_count: int
    intensity: float = Field(ge=0, le=1)


class HeatmapResponse(BaseModel):
    product_id: str
    product_name: str
    data: List[HeatmapProvinceData]
    generated_at: str


class MarketDataItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    avg_price: float
    change_percent: float
    trend: str
    unit: str
    province: Optional[str] = None


class MarketDataResponse(BaseModel):
    data: List[MarketDataItem]
    generated_at: str


class PriceHistoryPoint(BaseModel):
    month: str
    avg_price: float
    min_price: float
    max_price: float
    data_points: int


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_status: str
    timestamp: str
