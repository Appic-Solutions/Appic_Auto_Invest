import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialMode = {
  isDark: true,
};
const themeSlice = createSlice({
  name: "themeSlice",
  initialState: initialMode,
  reducers: {
    switchMode: (state) => {
      state.isDark = !state.isDark;
    },
    setMode: (state, action) => {
      state.isDark = action.payload;
    },
  },
});

const initialsideBar = {
  isActive: true,
};

const sidebarSlice = createSlice({
  name: "sidbarSlice",
  initialState: initialsideBar,
  reducers: {
    reverseSideBar: (state) => {
      console.log(state);
      state.isActive = !state.isActive;
    },
  },
});

export const themeReducer = themeSlice.reducer;
export const { switchMode, setMode } = themeSlice.actions;

export const sidebarReducer = sidebarSlice.reducer;
export const { reverseSideBar } = sidebarSlice.actions;
