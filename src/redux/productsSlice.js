import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchNewArrivals = createAsyncThunk(
  "products/fetchNewArrivals",
  async (_, { rejectWithValue }) => {
    const baseUrl = "http://localhost:9000";
    try {
      const response = await fetch(`${baseUrl}/api/products?period=week`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSpecialOffers = createAsyncThunk(
  "products/fetchSpecialOffers",
  async (_, { rejectWithValue }) => {
    const baseUrl = "http://localhost:9000";
    try {
      const response = await fetch(
        `${baseUrl}/api/products?specialOffers=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  "products/fetchBestSellers",
  async (_, { rejectWithValue }) => {
    const baseUrl = "http://localhost:9000";
    try {
      const response = await fetch(`${baseUrl}/api/products?bestsellers=true`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New action to fetch all products for search
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    const baseUrl = "http://localhost:9000";
    try {
      const response = await fetch(`${baseUrl}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFilteredProducts = createAsyncThunk(
  "products/fetchFilteredProducts",
  async (
    { selectedCategories, selectedTags, selectedPriceRanges, priceRanges },
    { rejectWithValue }
  ) => {
    const baseUrl = "http://localhost:9000";
    let url = `${baseUrl}/api/products`;
    const params = new URLSearchParams();

    // Add category IDs
    if (selectedCategories.length > 0) {
      params.append("categoryIds", selectedCategories.join(","));
    }

    // Add tag IDs
    if (selectedTags.length > 0) {
      params.append("tagIds", selectedTags.join(","));
    }

    // Combine selected price ranges into a single minPrice and maxPrice
    if (selectedPriceRanges.length > 0) {
      const selectedRanges = priceRanges.filter((range) =>
        selectedPriceRanges.includes(range.id)
      );
      if (selectedRanges.length > 0) {
        const minPrice = Math.min(
          ...selectedRanges.map((range) => range.priceOne)
        );
        const maxPrice = Math.max(
          ...selectedRanges.map((range) => range.priceTwo)
        );
        params.append("minPrice", minPrice.toFixed(2));
        params.append("maxPrice", maxPrice.toFixed(2));
      }
    }

    // Construct URL with query parameters if any
    if ([...params].length > 0) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    newArrivals: [],
    specialOffers: [],
    bestSellers: [],
    filteredProducts: [],
    allProducts: [], // New state for all products
    status: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewArrivals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.newArrivals = action.payload;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An unexpected error occurred";
      })
      .addCase(fetchSpecialOffers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSpecialOffers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.specialOffers = action.payload;
      })
      .addCase(fetchSpecialOffers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An unexpected error occurred";
      })
      .addCase(fetchBestSellers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An unexpected error occurred";
      })
      .addCase(fetchAllProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allProducts = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An unexpected error occurred";
      })
      .addCase(fetchFilteredProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.filteredProducts = action.payload;
      })
      .addCase(fetchFilteredProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An unexpected error occurred";
      });
  },
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;