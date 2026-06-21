// Modal slice - controls two things:
// 1. whether the login/register modal is showing
// 2. the font size on the player page summary text

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  isOpen: boolean;  // true = show the auth modal
  fontSize: number; // font size in px for the player summary text
}

const initialState: ModalState = {
  isOpen: false,
  fontSize: 16, // default size
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state)  { state.isOpen = true;  },
    closeModal(state) { state.isOpen = false; },
    // called when user clicks the Aa buttons in the sidebar on the player page
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = action.payload;
    },
  },
});

export const { openModal, closeModal, setFontSize } = modalSlice.actions;
export default modalSlice.reducer;
