import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTags = createAsyncThunk(
  "tags/fetchTags",
  async (_, { rejectWithValue }) => {
    const baseUrl = "http://localhost:9000"; // Adjust if needed

    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tagsSlice = createSlice({
  name: "tags",
  initialState: {
    tags: [],
    selectedTags: [], // Store selected tag IDs
    status: "idle",
    error: null,
  },
  reducers: {
    toggleTagSelection: (state, action) => {
      const tagId = action.payload;
      if (state.selectedTags.includes(tagId)) {
        state.selectedTags = state.selectedTags.filter((id) => id !== tagId);
      } else {
        state.selectedTags.push(tagId);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An unexpected error occurred";
      });
  },
});

export const { toggleTagSelection, clearError } = tagsSlice.actions;
export default tagsSlice.reducer;
