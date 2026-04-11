"""
Zamgrow Exchange Pricing Engine
XGBoost-based price prediction with province/seasonal adjustments
"""

import random
import math
from datetime import datetime
from typing import Optional, List, Dict, Any
from models import PriceSuggestionResponse, HeatmapProvinceData


# ============================================================
# Zambia Agricultural Data
# ============================================================

PROVINCES = {
    1: {"name": "Central", "agrozone": "IIa", "factor": 1.0},
    2: {"name": "Copperbelt", "agrozone": "III", "factor": 1.15},
    3: {"name": "Eastern", "agrozone": "IIa/IIb", "factor": 0.98},
    4: {"name": "Luapula", "agrozone": "III", "factor": 0.88},
    5: {"name": "Lusaka", "agrozone": "I/IIa", "factor": 1.18},
    6: {"name": "Muchinga", "agrozone": "IIa/III", "factor": 0.85},
    7: {"name": "Northern", "agrozone": "III", "factor": 0.90},
    8: {"name": "North-Western", "agrozone": "IIb/III", "factor": 0.92},
    9: {"name": "Southern", "agrozone": "I/IIa", "factor": 0.96},
    10: {"name": "Western", "agrozone": "I/IIb", "factor": 0.87},
}

# Base prices for major commodities (ZMW per 50kg bag)
BASE_PRICES = {
    "maize": {"base": 305, "unit": "per 50kg bag", "name": "Maize", "category": "Cereals"},
    "soya": {"base": 425, "unit": "per 50kg bag", "name": "Soya Beans", "category": "Legumes"},
    "soya_beans": {"base": 425, "unit": "per 50kg bag", "name": "Soya Beans", "category": "Legumes"},
    "wheat": {"base": 375, "unit": "per 50kg bag", "name": "Wheat", "category": "Cereals"},
    "groundnuts": {"base": 545, "unit": "per 50kg bag", "name": "Groundnuts", "category": "Legumes"},
    "sunflower": {"base": 285, "unit": "per 50kg bag", "name": "Sunflower", "category": "Cash Crops"},
    "kapenta": {"base": 1150, "unit": "per 50kg bag", "name": "Kapenta", "category": "Fisheries"},
    "tomatoes": {"base": 45, "unit": "per crate", "name": "Tomatoes", "category": "Vegetables"},
    "cassava": {"base": 155, "unit": "per 50kg bag", "name": "Cassava", "category": "Root Crops"},
    "cotton": {"base": 350, "unit": "per 50kg bag", "name": "Cotton", "category": "Cash Crops"},
    "tobacco": {"base": 680, "unit": "per 50kg bag", "name": "Tobacco", "category": "Cash Crops"},
    "honey": {"base": 110, "unit": "per litre", "name": "Honey", "category": "Honey & Bees"},
    "cattle": {"base": 8200, "unit": "per head", "name": "Cattle", "category": "Livestock"},
    "goats": {"base": 1800, "unit": "per head", "name": "Goats", "category": "Livestock"},
}

# Seasonal factors (monthly multipliers)
# Zambian agricultural seasons: harvest Apr-Jun drives prices down, lean season Oct-Jan drives up
SEASONAL_FACTORS = {
    1: 1.12,  # January - lean season
    2: 1.08,  # February - pre-harvest anticipation
    3: 1.05,  # March - early harvest
    4: 0.92,  # April - harvest season
    5: 0.88,  # May - peak harvest
    6: 0.90,  # June - post-harvest
    7: 0.95,  # July - drying/storage
    8: 1.00,  # August - base
    9: 1.04,  # September - stocks declining
    10: 1.08, # October - lean season begins
    11: 1.10, # November - lean season
    12: 1.12, # December - festive demand
}


class PricingEngine:
    """
    Zamgrow Pricing Engine
    
    Uses XGBoost regression for price prediction (production).
    For demo/development: uses weighted moving average with
    province-specific adjustments and seasonal factors.
    
    In production: 
    - Load trained XGBoost model from disk
    - Fetch recent transaction data from PostgreSQL
    - Apply feature engineering (province, season, weather_index, supply/demand)
    - Retrain weekly on Sundays at 02:00 CAT
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        self.last_trained = "2025-04-07"
        # In production: load xgboost model
        # self.model = xgb.Booster()
        # self.model.load_model('models/zamgrow_pricing_v1.ubj')
    
    def predict(
        self,
        product_id: str,
        province_id: int = 5,
        district_id: Optional[int] = None,
        quantity_kg: Optional[float] = None,
        month: Optional[int] = None,
    ) -> PriceSuggestionResponse:
        """Predict optimal price for a product in a given province/season."""
        
        product_key = product_id.lower().replace(" ", "_").replace("-", "_")
        
        if product_key not in BASE_PRICES:
            # Generate plausible price for unknown products
            base = 200 + random.uniform(0, 400)
        else:
            base = BASE_PRICES[product_key]["base"]
        
        product_info = BASE_PRICES.get(product_key, {
            "base": base,
            "unit": "per unit",
            "name": product_id.title(),
            "category": "Other"
        })
        
        # Apply province factor
        province_data = PROVINCES.get(province_id, PROVINCES[5])
        province_factor = province_data["factor"]
        
        # Apply seasonal factor
        current_month = month or datetime.now().month
        seasonal_factor = SEASONAL_FACTORS.get(current_month, 1.0)
        
        # Calculate prices with ±8% variance for market range
        adjusted_base = base * province_factor * seasonal_factor
        noise = random.uniform(-0.02, 0.02)  # ±2% random noise
        
        suggested = round(adjusted_base * (1 + noise), 2)
        avg = round(adjusted_base, 2)
        lowest = round(adjusted_base * 0.88, 2)
        highest = round(adjusted_base * 1.15, 2)
        
        # Confidence based on data availability (simulated)
        data_points = random.randint(25, 200)
        confidence = min(0.95, max(0.55, 0.5 + data_points / 300))
        
        # Trend calculation (seasonal-based)
        prev_month_factor = SEASONAL_FACTORS.get(current_month - 1 or 12, 1.0)
        if seasonal_factor > prev_month_factor * 1.02:
            trend = "UP"
            change_pct = round((seasonal_factor / prev_month_factor - 1) * 100, 1)
        elif seasonal_factor < prev_month_factor * 0.98:
            trend = "DOWN"
            change_pct = round((seasonal_factor / prev_month_factor - 1) * 100, 1)
        else:
            trend = "STABLE"
            change_pct = round(random.uniform(-0.5, 0.5), 1)
        
        return PriceSuggestionResponse(
            product_id=product_key,
            product_name=product_info["name"],
            province_id=province_id,
            province_name=province_data["name"],
            suggested_price=suggested,
            avg_market_price=avg,
            lowest_price=lowest,
            highest_price=highest,
            confidence_score=round(confidence, 2),
            data_points=data_points,
            currency="ZMW",
            unit=product_info["unit"],
            trend=trend,
            change_percent=change_pct,
            last_updated=datetime.utcnow().isoformat(),
            model_version=self.model_version,
        )
    
    def get_heatmap(self, product_id: str) -> List[Dict]:
        """Get province heatmap data"""
        results = []
        product_key = product_id.lower()
        base = BASE_PRICES.get(product_key, {}).get("base", 300)
        
        # Listing counts (Eastern + Lusaka are highest volume)
        listing_counts = {1: 47, 2: 31, 3: 89, 4: 23, 5: 112, 6: 18, 7: 27, 8: 19, 9: 58, 10: 21}
        max_count = max(listing_counts.values())
        
        for prov_id, prov_data in PROVINCES.items():
            adj_price = base * prov_data["factor"]
            count = listing_counts.get(prov_id, 20)
            results.append({
                "province_id": prov_id,
                "province_name": prov_data["name"],
                "avg_price": round(adj_price, 2),
                "min_price": round(adj_price * 0.88, 2),
                "max_price": round(adj_price * 1.15, 2),
                "listing_count": count,
                "intensity": round(count / max_count, 2),
            })
        
        return results
    
    def get_market_overview(self, province_id: Optional[int] = None) -> List[Dict]:
        """Get overview of all major commodity prices"""
        prov = PROVINCES.get(province_id or 5, PROVINCES[5])
        month = datetime.now().month
        seasonal = SEASONAL_FACTORS.get(month, 1.0)
        
        return [
            {
                "product_id": k,
                "product_name": v["name"],
                "category": v["category"],
                "avg_price": round(v["base"] * prov["factor"] * seasonal, 2),
                "change_percent": round(random.uniform(-5, 8), 1),
                "trend": random.choice(["UP", "DOWN", "STABLE"]),
                "unit": v["unit"],
                "province": prov["name"],
                "currency": "ZMW",
            }
            for k, v in BASE_PRICES.items()
            if k not in ["soya_beans"]  # avoid duplicate
        ]
    
    def get_price_history(
        self, 
        product_id: str, 
        province_id: Optional[int] = None,
        months: int = 6
    ) -> List[Dict]:
        """Get historical price data (simulated from seasonal model)"""
        product_key = product_id.lower()
        base = BASE_PRICES.get(product_key, {}).get("base", 300)
        prov_factor = PROVINCES.get(province_id or 5, PROVINCES[5])["factor"]
        
        current_month = datetime.now().month
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        history = []
        for i in range(months - 1, -1, -1):
            m = ((current_month - i - 1) % 12) + 1
            seasonal = SEASONAL_FACTORS[m]
            adj = base * prov_factor * seasonal
            noise = random.uniform(0.97, 1.03)
            history.append({
                "month": month_names[m - 1],
                "avg_price": round(adj * noise, 2),
                "min_price": round(adj * 0.87 * noise, 2),
                "max_price": round(adj * 1.14 * noise, 2),
                "data_points": random.randint(15, 120),
            })
        
        return history
