import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import loginReducer from "./loginSlice";
import cartReducer from "./cartSlice";
import orebiReducer from "./orebiSlice";
import productsReducer from "./productsSlice";
import categoriesReducer from "./categoriesSlice";
import tagsReducer from "./tagsSlice";
import priceRangesReducer from "./priceRangesSlice";
import orderReducer from "./orderSlice";
import paymentReducer from "./paymentSlice";

const loginPersistConfig = {
  key: "login",
  version: 1,
  storage,
  whitelist: ["token", "userInfo", "permissions"],
};

const cartPersistConfig = {
  key: "cart",
  version: 1,
  storage,
  whitelist: ["products"],
};

const persistedLoginReducer = persistReducer(loginPersistConfig, loginReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    login: persistedLoginReducer,
    cart: persistedCartReducer,
    orebi: orebiReducer,
    products: productsReducer,
    categories: categoriesReducer,
    tags: tagsReducer,
    priceRanges: priceRangesReducer,
    orders: orderReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);
