// Auth slice - keeps track of who is logged in
// This gets saved to localStorage so the user stays logged in on refresh

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: { uid: string; email: string | null } | null; // null when nobody is logged in
  loading: boolean;       // true until Firebase tells us if someone is logged in
  subscription: "basic" | "premium" | "premium-plus"; // what plan the user is on
}

const initialState: AuthState = {
  user: null,
  loading: true,        // start as true because we don't know yet
  subscription: "basic", // default to free plan
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // called from _app.tsx when Firebase auth state changes
    setUser(state, action: PayloadAction<{ uid: string; email: string | null } | null>) {
      state.user    = action.payload;
      state.loading = false; // done loading once we get a response
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    // called after the user picks a plan on choose-plan page
    setSubscription(state, action: PayloadAction<"basic" | "premium" | "premium-plus">) {
      state.subscription = action.payload;
    },
  },
});

export const { setUser, setLoading, setSubscription } = authSlice.actions;
export default authSlice.reducer;
