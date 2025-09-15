import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientName: "",
  email: "",
  phone: "",
  password: "",
  address: "",
  city: "",
  country: "",
  zip: "",
  successMsg: "",
  errorMsg: "", // Can be plain text or JSON string
  isValidationError: false, // Flag to indicate if errorMsg is a JSON validation error
  loading: false,
  checked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setClientName: (state, action) => {
      state.clientName = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPhone: (state, action) => {
      state.phone = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setCountry: (state, action) => {
      state.country = action.payload;
    },
    setZip: (state, action) => {
      state.zip = action.payload;
    },
    setChecked: (state, action) => {
      state.checked = action.payload;
    },
    signupStart: (state) => {
      state.loading = true;
      state.successMsg = "";
      state.errorMsg = "";
      state.isValidationError = false;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.successMsg = action.payload;
      state.clientName = "";
      state.email = "";
      state.phone = "";
      state.password = "";
      state.address = "";
      state.city = "";
      state.country = "";
      state.zip = "";
      state.isValidationError = false;
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.errorMsg = action.payload;
      state.isValidationError =
        typeof action.payload === "object" ||
        (typeof action.payload === "string" && action.payload.startsWith("{"));
    },
    clearMessages: (state) => {
      state.successMsg = "";
      state.errorMsg = "";
      state.isValidationError = false;
    },
  },
});

export const {
  setClientName,
  setEmail,
  setPhone,
  setPassword,
  setAddress,
  setCity,
  setCountry,
  setZip,
  setChecked,
  signupStart,
  signupSuccess,
  signupFailure,
  clearMessages,
} = authSlice.actions;

export default authSlice.reducer;
