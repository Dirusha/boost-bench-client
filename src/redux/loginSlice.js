import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  userInfo: null,
  permissions: [],
  loading: false,
  error: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.userInfo = {
        id: action.payload.id,
        username: action.payload.username,
        roles: action.payload.roles,
      };
      state.permissions = action.payload.permissions;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.userInfo = null;
      state.permissions = [];
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  loginSlice.actions;
export default loginSlice.reducer;
