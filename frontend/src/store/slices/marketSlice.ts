import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PriceDataPoint {
  date: string
  price: number
  volume: number
  province: string
}

export interface HeatmapData {
  province: string
  provinceId: number
  avgPrice: number
  totalListings: number
  priceChange: number
}

interface MarketState {
  priceData: PriceDataPoint[]
  heatmapData: HeatmapData[]
  selectedProduct: string
  selectedProvince: string
  loading: boolean
}

const initialState: MarketState = {
  priceData: [],
  heatmapData: [],
  selectedProduct: 'Maize',
  selectedProvince: 'all',
  loading: false,
}

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPriceData: (state, action: PayloadAction<PriceDataPoint[]>) => {
      state.priceData = action.payload
    },
    setHeatmapData: (state, action: PayloadAction<HeatmapData[]>) => {
      state.heatmapData = action.payload
    },
    setSelectedProduct: (state, action: PayloadAction<string>) => {
      state.selectedProduct = action.payload
    },
    setSelectedProvince: (state, action: PayloadAction<string>) => {
      state.selectedProvince = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setPriceData, setHeatmapData, setSelectedProduct, setSelectedProvince, setLoading } = marketSlice.actions
export default marketSlice.reducer
