"""
Mock ML pricing engine using statistical models.
In production, replace with trained XGBoost model.
"""
import random
import math
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from models import PriceSuggestion, HeatmapPoint, PriceHistoryPoint


# Zambian provinces
PROVINCES = [
    {"id": 1, "name": "Central"},
    {"id": 2, "name": "Copperbelt"},
    {"id": 3, "name": "Eastern"},
    {"id": 4, "name": "Luapula"},
    {"id": 5, "name": "Lusaka"},
    {"id": 6, "name": "Muchinga"},
    {"id": 7, "name": "Northern"},
    {"id": 8, "name": "North-Western"},
    {"id": 9, "name": "Southern"},
    {"id": 10, "name": "Western"},
]

# Base prices in ZMW per unit (2024 market data)
BASE_PRICES: Dict[str, Dict[str, Any]] = {
    "Maize": {"base": 180, "unit": "bag (50kg)", "volatility": 0.12, "trend": "up"},
    "Soya Beans": {"base": 3200, "unit": "50kg bag", "volatility": 0.15, "trend": "up"},
    "Wheat": {"base": 5200, "unit": "50kg bag", "volatility": 0.08, "trend": "stable"},
    "Groundnuts": {"base": 4500, "unit": "50kg bag", "volatility": 0.18, "trend": "down"},
    "Tomatoes": {"base": 85, "unit": "crate (20kg)", "volatility": 0.25, "trend": "up"},
    "Cabbage": {"base": 8, "unit": "head", "volatility": 0.30, "trend": "down"},
    "Cattle": {"base": 8500, "unit": "head", "volatility": 0.10, "trend": "stable"},
    "Goats": {"base": 1500, "unit": "head", "volatility": 0.12, "trend": "up"},
    "Tilapia": {"base": 45, "unit": "kg", "volatility": 0.15, "trend": "stable"},
    "Kapenta": {"base": 120, "unit": "kg", "volatility": 0.20, "trend": "up"},
    "Fresh Milk": {"base": 12, "unit": "litre", "volatility": 0.08, "trend": "stable"},
    "Broilers": {"base": 120, "unit": "kg", "volatility": 0.12, "trend": "up"},
    "Eggs": {"base": 72, "unit": "tray (30)", "volatility": 0.10, "trend": "stable"},
    "Cassava": {"base": 180, "unit": "50kg bag", "volatility": 0.20, "trend": "stable"},
    "Sweet Potatoes": {"base": 150, "unit": "50kg bag", "volatility": 0.22, "trend": "up"},
    "Tobacco": {"base": 18000, "unit": "50kg bale", "volatility": 0.05, "trend": "stable"},
    "Cotton": {"base": 7500, "unit": "50kg bag", "volatility": 0.08, "trend": "down"},
    "Sunflower": {"base": 3800, "unit": "50kg bag", "volatility": 0.12, "trend": "up"},
    "Onions": {"base": 180, "unit": "50kg bag", "volatility": 0.28, "trend": "up"},
    "Beans": {"base": 5500, "unit": "50kg bag", "volatility": 0.15, "trend": "stable"},
}

# Province price multipliers (supply/demand factors)
PROVINCE_MULTIPLIERS: Dict[str, float] = {
    "Central": 1.00,
    "Copperbelt": 1.08,   # Higher demand, mining workers
    "Eastern": 0.92,       # Major producing region
    "Luapula": 1.05,
    "Lusaka": 1.12,        # Capital city premium
    "Muchinga": 0.95,
    "Northern": 0.97,
    "North-Western": 1.10, # Remote, transport costs
    "Southern": 0.94,      # Major producing region
    "Western": 1.06,
}

# Seasonal factors by month (0=Jan, 11=Dec)
# Maize harvest: May-July prices drop, Jan-Mar prices rise
SEASONAL_FACTORS = [1.15, 1.10, 1.05, 1.00, 0.90, 0.85, 0.88, 0.92, 0.98, 1.05, 1.10, 1.12]


def get_seasonal_factor() -> float:
    month = datetime.now().month - 1
    return SEASONAL_FACTORS[month]


def get_quantity_factor(quantity_kg: float) -> float:
    """Bulk discount factor"""
    if quantity_kg >= 10000:
        return 0.92
    elif quantity_kg >= 5000:
        return 0.95
    elif quantity_kg >= 1000:
        return 0.97
    elif quantity_kg >= 500:
        return 0.99
    return 1.0


def calculate_price_suggestion(
    product_id: str,
    province_id: str = "all",
    quantity_kg: float = 100.0
) -> PriceSuggestion:
    """
    Calculate price suggestion using statistical model.
    Production version would use trained XGBoost/LightGBM model.
    """
    product_data = BASE_PRICES.get(product_id, BASE_PRICES["Maize"])
    base_price = product_data["base"]

    # Apply province multiplier
    province_mult = PROVINCE_MULTIPLIERS.get(province_id, 1.0)

    # Apply seasonal factor
    seasonal = get_seasonal_factor()

    # Apply quantity discount
    qty_factor = get_quantity_factor(quantity_kg)

    # Calculate adjusted base
    adjusted_base = base_price * province_mult * seasonal * qty_factor

    # Calculate range based on market volatility
    volatility = product_data["volatility"]
    min_price = round(adjusted_base * (1 - volatility * 0.8), 2)
    avg_price = round(adjusted_base, 2)
    max_price = round(adjusted_base * (1 + volatility * 0.8), 2)

    # Confidence based on data availability (mock)
    confidence = round(random.uniform(65, 95), 1)

    # Sample size (mock)
    sample_size = random.randint(15, 250)

    return PriceSuggestion(
        product=product_id,
        province=province_id,
        quantity_kg=quantity_kg,
        min_price=min_price,
        avg_price=avg_price,
        max_price=max_price,
        confidence=confidence,
        trend=product_data["trend"],
        sample_size=sample_size,
        last_updated=datetime.now().isoformat(),
    )


def calculate_heatmap(product_id: str = "Maize") -> List[HeatmapPoint]:
    """Generate province heatmap data"""
    product_data = BASE_PRICES.get(product_id, BASE_PRICES["Maize"])
    base_price = product_data["base"]
    seasonal = get_seasonal_factor()

    result = []
    for province in PROVINCES:
        name = province["name"]
        mult = PROVINCE_MULTIPLIERS.get(name, 1.0)
        noise = random.uniform(0.96, 1.04)
        avg_price = round(base_price * mult * seasonal * noise, 2)
        min_price = round(avg_price * 0.85, 2)
        max_price = round(avg_price * 1.15, 2)
        price_change = round(random.uniform(-8, 12), 1)
        total_listings = random.randint(10, 120)

        result.append(HeatmapPoint(
            province=name,
            province_id=province["id"],
            avg_price=avg_price,
            total_listings=total_listings,
            price_change=price_change,
            min_price=min_price,
            max_price=max_price,
        ))

    return sorted(result, key=lambda x: x.province)


def generate_price_history(
    product_id: str,
    province: str = "all",
    days: int = 180
) -> List[PriceHistoryPoint]:
    """Generate historical price data for charts"""
    product_data = BASE_PRICES.get(product_id, BASE_PRICES["Maize"])
    base_price = product_data["base"]
    volatility = product_data["volatility"]
    prov_mult = PROVINCE_MULTIPLIERS.get(province, 1.0) if province != "all" else 1.0

    result = []
    current_price = base_price * prov_mult

    for i in range(days, -1, -7):  # weekly data points
        date = datetime.now() - timedelta(days=i)
        month_idx = date.month - 1
        seasonal = SEASONAL_FACTORS[month_idx]

        # Random walk with seasonal adjustment
        change = random.gauss(0, volatility * 0.05) * current_price
        current_price = max(
            base_price * 0.7,
            min(base_price * 1.4, current_price + change)
        )
        adjusted_price = round(current_price * seasonal, 2)
        volume = round(random.uniform(20, 300), 1)

        result.append(PriceHistoryPoint(
            date=date.strftime("%Y-%m-%d"),
            price=adjusted_price,
            volume=volume,
            province=province,
        ))

    return result
