import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://localhost:9000/api";

export const initiatePayment = createAsyncThunk(
  "payment/initiatePayment",
  async ({ orderId, userId, customerDetails, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/initiate/${orderId}?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(customerDetails),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorText || "Forbidden"
          }`
        );
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to initiate payment");
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchPaymentStatus",
  async ({ orderId, userId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/status/${orderId}?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorText || "Forbidden"
          }`
        );
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch payment status");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    paymentData: null,
    paymentStatus: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPaymentState: (state) => {
      state.paymentData = null;
      state.paymentStatus = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.paymentData = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.paymentStatus = action.payload;
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
