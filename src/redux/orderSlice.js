import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://localhost:9000/api/orders";

export const placeOrder = createAsyncThunk(
  "orders/placeOrder",
  async ({ userId, token, cart }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/place/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.products.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cart.totalAmount,
          shippingCharge: cart.shippingCharge,
          discount: cart.discount,
          appliedCoupon: cart.appliedCoupon || "",
        }),
      });
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
      return rejectWithValue(error.message || "Failed to place order");
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async ({ orderId, userId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${orderId}/user/${userId}`,
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
      return rejectWithValue(error.message || "Failed to fetch order");
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorText || "Forbidden"
          }`
        );
      }
      const orders = await response.json();
      // Assuming backend returns orders with payment status
      return orders.map((order) => ({
        ...order,
        paymentStatus: order.paymentStatus || "Pending", // Default if not provided
      }));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user orders");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
