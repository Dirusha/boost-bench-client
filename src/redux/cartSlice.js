import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const baseUrl = "http://localhost:9000";

// Helper function to fetch product details
const fetchProductDetails = async (productId) => {
  const response = await fetch(`${baseUrl}/api/products/${productId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product details for ID: ${productId}`);
  }

  return response.json();
};

// Fetch user's cart with full product details
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const cartResponse = await fetch(`${baseUrl}/api/cart/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!cartResponse.ok) {
        if (cartResponse.status === 400) {
          // Cart doesn't exist, return empty cart
          return [];
        }
        throw new Error(
          `HTTP error fetching cart for user ${userId}! status: ${cartResponse.status}`
        );
      }

      const cartData = await cartResponse.json();
      const cartItems = cartData.items || [];

      if (cartItems.length === 0) {
        return [];
      }

      const itemsWithDetails = await Promise.all(
        cartItems.map(async (cartItem) => {
          try {
            const productDetails = await fetchProductDetails(
              cartItem.productId
            );
            return {
              _id: cartItem.productId,
              cartItemId: cartItem.id,
              name: productDetails.name,
              description: productDetails.description,
              price: productDetails.price,
              image: productDetails.imageUrls?.[0] || "/placeholder-image.jpg",
              images: productDetails.imageUrls || [],
              quantity: cartItem.quantity,
              availableQuantity: productDetails.availableQuantity,
              discount: productDetails.discount || 0,
              colors: productDetails.color,
              sku: productDetails.sku,
              categoryIds: productDetails.categoryIds,
              tagIds: productDetails.tagIds,
              originalPrice: productDetails.discount
                ? productDetails.price + productDetails.discount
                : null,
            };
          } catch (error) {
            console.error(
              `Failed to fetch details for product ${cartItem.productId}:`,
              error
            );
            return {
              _id: cartItem.productId,
              cartItemId: cartItem.id,
              name: cartItem.productName || "Unknown Product",
              price: 0,
              quantity: cartItem.quantity,
              image: "/placeholder-image.jpg",
              error: "Failed to load product details",
            };
          }
        })
      );

      return itemsWithDetails;
    } catch (error) {
      console.error(`Error in fetchCart for user ${userId}:`, error);
      return rejectWithValue(error.message);
    }
  }
);

// Create a new cart for the user
const createCart = async (userId, token) => {
  const response = await fetch(`${baseUrl}/api/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, items: [] }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create cart: ${response.status}`);
  }

  return response.json();
};

// Add item to cart
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (
    { userId, token, productId, quantity, productData },
    { rejectWithValue }
  ) => {
    try {
      // Attempt to add item to cart
      const response = await fetch(
        `${baseUrl}/api/cart/${userId}/items?productId=${productId}&quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          // Cart might not exist, try creating it
          await createCart(userId, token);
          // Retry adding the item
          const retryResponse = await fetch(
            `${baseUrl}/api/cart/${userId}/items?productId=${productId}&quantity=${quantity}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!retryResponse.ok) {
            throw new Error(
              `HTTP error adding item to cart after creation! status: ${retryResponse.status}`
            );
          }

          const retryData = await retryResponse.json();
          return await buildCartItemResponse(
            retryData,
            productId,
            quantity,
            productData
          );
        }
        throw new Error(
          `HTTP error adding item to cart! status: ${response.status}`
        );
      }

      const data = await response.json();
      return await buildCartItemResponse(
        data,
        productId,
        quantity,
        productData
      );
    } catch (error) {
      console.error(`Error in addItemToCart for user ${userId}:`, error);
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to build cart item response
const buildCartItemResponse = async (
  data,
  productId,
  quantity,
  productData
) => {
  let fullProductData = productData;
  if (!fullProductData) {
    try {
      const productDetails = await fetchProductDetails(productId);
      fullProductData = {
        _id: productId,
        name: productDetails.name,
        description: productDetails.description,
        price: productDetails.price,
        image: productDetails.imageUrls?.[0] || "/placeholder-image.jpg",
        images: productDetails.imageUrls || [],
        availableQuantity: productDetails.availableQuantity,
        discount: productDetails.discount || 0,
        colors: productDetails.color,
        sku: productDetails.sku,
        categoryIds: productDetails.categoryIds,
        tagIds: productDetails.tagIds,
        originalPrice: productDetails.discount
          ? productDetails.price + productDetails.discount
          : null,
      };
    } catch (error) {
      console.error(`Failed to fetch product details for ${productId}:`, error);
      fullProductData = {
        _id: productId,
        name: "Unknown Product",
        price: 0,
        image: "/placeholder-image.jpg",
      };
    }
  }

  return {
    apiResponse: data,
    productData: {
      ...fullProductData,
      quantity,
      cartItemId: data.itemId,
    },
  };
};

// Update cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async ({ userId, token, itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/cart/${userId}/items/${itemId}?quantity=${quantity}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error updating item quantity! status: ${response.status}`
        );
      }

      const data = await response.json();
      return { itemId, quantity, apiResponse: data };
    } catch (error) {
      console.error(
        `Error in updateCartItemQuantity for user ${userId}, item ${itemId}:`,
        error
      );
      return rejectWithValue(error.message);
    }
  }
);

// Remove item from cart
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ userId, token, itemId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/cart/${userId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error removing item from cart! status: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (
        contentType &&
        contentType.includes("application/json") &&
        response.status !== 204
      ) {
        data = await response.json();
      } else {
        data = { message: "Cart item removed successfully" };
      }

      return { itemId, apiResponse: data };
    } catch (error) {
      console.error(
        `Error in removeCartItem for user ${userId}, item ${itemId}:`,
        error
      );
      return rejectWithValue(error.message);
    }
  }
);

// Clear entire cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/api/cart/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error clearing cart! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (
        contentType &&
        contentType.includes("application/json") &&
        response.status !== 204
      ) {
        data = await response.json();
      } else {
        data = { message: "Cart cleared successfully" };
      }

      return data;
    } catch (error) {
      console.error(`Error in clearCart for user ${userId}:`, error);
      return rejectWithValue(error.message);
    }
  }
);

// Apply coupon code
export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async ({ userId, token, couponCode }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/api/cart/${userId}/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponCode }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error applying coupon! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        `Error in applyCoupon for user ${userId}, coupon ${couponCode}:`,
        error
      );
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    products: [],
    status: "idle",
    error: null,
    totalAmount: 0,
    shippingCharge: 0,
    appliedCoupon: null,
    discount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      let total = 0;
      state.products.forEach((item) => {
        total += item.price * item.quantity;
      });
      state.totalAmount = total - state.discount;

      if (total <= 200) {
        state.shippingCharge = 30;
      } else if (total <= 400) {
        state.shippingCharge = 25;
      } else {
        state.shippingCharge = 20;
      }
    },
    resetCartState: (state) => {
      state.products = [];
      state.totalAmount = 0;
      state.shippingCharge = 0;
      state.appliedCoupon = null;
      state.discount = 0;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch cart";
        state.products = []; // Ensure empty cart on failure
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(addItemToCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { productData } = action.payload;
        const existingItem = state.products.find(
          (item) => item._id === productData._id
        );

        if (existingItem) {
          existingItem.quantity += productData.quantity;
        } else {
          state.products.push(productData);
        }

        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add item to cart";
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { itemId, quantity } = action.payload;
        const item = state.products.find(
          (item) => item.cartItemId === itemId || item._id === itemId
        );
        if (item) {
          item.quantity = quantity;
        }
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update item quantity";
      })
      .addCase(removeCartItem.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { itemId } = action.payload;
        state.products = state.products.filter(
          (item) => item.cartItemId !== itemId && item._id !== itemId
        );
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove item from cart";
      })
      .addCase(clearCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = "succeeded";
        state.products = [];
        state.totalAmount = 0;
        state.shippingCharge = 0;
        state.appliedCoupon = null;
        state.discount = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to clear cart";
      })
      .addCase(applyCoupon.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.status = "succeeded";
        const couponData = action.payload;
        state.appliedCoupon = couponData.coupon;
        state.discount = couponData.discount || 0;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to apply coupon";
      });
  },
});

export const { clearError, calculateTotals, resetCartState } =
  cartSlice.actions;
export default cartSlice.reducer;
