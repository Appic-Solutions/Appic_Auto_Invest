import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialMode = {
  pageTitle: "",
};
const pageSlice = createSlice({
  name: "pageSlice",
  initialState: initialMode,
  reducers: {
    changePageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
  },
});
export const pageReducer = pageSlice.reducer;
export const { changePageTitle } = pageSlice.actions;
