import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PriceData, HeatmapData } from '../../types'
import { MOCK_PRICE_DATA, MOCK_HEATMAP_DATA } from '../../services/mockData'

interface MarketState {
  priceData: PriceData[]
  heatmapData: HeatmapData[]
  selectedProduct: string
  selectedProvince: string
  isLoading: boolean
}

const initialState: MarketState = {
  priceData: MOCK_PRICE_DATA,
  heatmapData: MOCK_HEATMAP_DATA,
  selectedProduct: 'maize',
  selectedProvince: 'all',
  isLoading: false,
}

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPriceData(state, action: PayloadAction<PriceData[]>) { state.priceData = action.payload },
    setHeatmapData(state, action: PayloadAction<HeatmapData[]>) { state.heatmapData = action.payload },
    setSelectedProduct(state, action: PayloadAction<string>) { state.selectedProduct = action.payload },
    setSelectedProvince(state, action: PayloadAction<string>) { state.selectedProvince = action.payload },
    setLoading(state, action: PayloadAction<boolean>) { state.isLoading = action.payload },
  },
})

export const { setPriceData, setHeatmapData, setSelectedProduct, setSelectedProvince, setLoading } = marketSlice.actions
export default marketSlice.reducer
