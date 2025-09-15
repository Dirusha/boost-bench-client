import { createSlice } from "@reduxjs/toolkit";

const priceRangesSlice = createSlice({
  name: "priceRanges",
  initialState: {
    priceRanges: [], // Store user-defined price ranges
    selectedPriceRanges: [], // Store IDs of selected price ranges
  },
  reducers: {
    addPriceRange: (state, action) => {
      const { priceOne, priceTwo } = action.payload;
      const newId =
        state.priceRanges.length > 0
          ? Math.max(...state.priceRanges.map((range) => range.id)) + 1
          : 950; // Start IDs at 950 for consistency
      state.priceRanges.push({ id: newId, priceOne, priceTwo });
    },
    removePriceRange: (state, action) => {
      const id = action.payload;
      state.priceRanges = state.priceRanges.filter((range) => range.id !== id);
      state.selectedPriceRanges = state.selectedPriceRanges.filter(
        (selectedId) => selectedId !== id
      );
    },
    togglePriceRangeSelection: (state, action) => {
      const priceRangeId = action.payload;
      if (state.selectedPriceRanges.includes(priceRangeId)) {
        state.selectedPriceRanges = state.selectedPriceRanges.filter(
          (id) => id !== priceRangeId
        );
      } else {
        state.selectedPriceRanges.push(priceRangeId);
      }
    },
    clearPriceRanges: (state) => {
      state.priceRanges = [];
      state.selectedPriceRanges = [];
    },
  },
});

export const {
  addPriceRange,
  removePriceRange,
  togglePriceRangeSelection,
  clearPriceRanges,
} = priceRangesSlice.actions;
export default priceRangesSlice.reducer;
