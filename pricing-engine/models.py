from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PriceSuggestion(BaseModel):
    product: str
    province: str
    quantity_kg: float
    min_price: float
    avg_price: float
    max_price: float
    confidence: float
    trend: str  # up, down, stable
    sample_size: int
    last_updated: str


class HeatmapPoint(BaseModel):
    province: str
    province_id: int
    avg_price: float
    total_listings: int
    price_change: float
    min_price: float
    max_price: float


class PriceHistoryPoint(BaseModel):
    date: str
    price: float
    volume: float
    province: str


class PriceHistoryResponse(BaseModel):
    product: str
    province: str
    data: List[PriceHistoryPoint]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
