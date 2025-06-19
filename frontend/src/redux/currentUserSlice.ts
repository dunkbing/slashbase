import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { User } from "../data/models";
import storage from "../data/storage";
import apiService from "../network/apiService";
import { reset as apiReset } from "./apiSlice";
import { reset as configReset } from "./configSlice";
import { reset as dataModelReset } from "./dataModelSlice";
import { reset as dbConnReset } from "./dbConnectionSlice";
import { reset as dbQueryReset } from "./dbQuerySlice";
import { reset as projectReset } from "./projectsSlice";
import type { AppState } from "./store";

export interface CurrentUserState {
  user?: User;
  isAuthenticated: boolean | null;
}

const initialState: CurrentUserState = {
  isAuthenticated: null,
};

export const loginUser = createAsyncThunk(
  "currentUser/loginUser",
  async (
    payload: { email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    const response = await apiService.loginUser(
      payload.email,
      payload.password,
    );
    if (response.success) {
      await storage.loginCurrentUser(response.data.user);
      return {
        currentUser: response.data.user,
        isAuthenticated: true,
      };
    } else {
      return rejectWithValue(response.error);
    }
  },
);

export const getUser = createAsyncThunk("currentUser/getUser", async () => {
  const isAuthenticated = await apiService.isUserAuthenticated();
  const currentUser = await storage.getCurrentUser();
  return {
    currentUser,
    isAuthenticated,
  };
});

export const editUser = createAsyncThunk(
  "currentUser/editUser",
  async (
    payload: { name: string; profileImageUrl: string },
    { rejectWithValue },
  ) => {
    const response = await apiService.editUser(
      payload.name,
      payload.profileImageUrl,
    );
    if (response.success) {
      await storage.updateCurrentUser(response.data);
      return {
        currentUser: response.data,
      };
    } else {
      return rejectWithValue(response.error);
    }
  },
);

export const updateUser = createAsyncThunk(
  "currentUser/updateUser",
  async (payload: { user: User }, { rejectWithValue }) => {
    await storage.updateCurrentUser(payload.user);
    return {
      currentUser: payload.user,
    };
  },
);

export const logoutUser = createAsyncThunk(
  "currentUser/logoutUser",
  async (_, { dispatch }) => {
    await apiService.logoutUser();
    dispatch(clearLogin());
    return {
      currentUser: undefined,
      isAuthenticated: false,
    };
  },
);

export const clearLogin = createAsyncThunk(
  "currentUser/clearLogin",
  async (_, { dispatch }) => {
    await storage.logoutUser();
    dispatch(projectReset());
    dispatch(dbConnReset());
    dispatch(configReset());
    dispatch(apiReset());
    dispatch(dataModelReset());
    dispatch(dbQueryReset());
    return {
      currentUser: undefined,
      isAuthenticated: false,
    };
  },
);

export const userSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.user = action.payload.currentUser;
          state.isAuthenticated = action.payload.isAuthenticated;
        }
      })
      .addCase(getUser.fulfilled, (state, action: any) => {
        state.user = action.payload.currentUser
          ? action.payload.currentUser
          : undefined;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(clearLogin.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.user = action.payload.currentUser;
          state.isAuthenticated = action.payload.isAuthenticated;
        }
      })
      .addCase(editUser.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.user = action.payload.currentUser;
        }
      })
      .addCase(updateUser.fulfilled, (state, action: any) => {
        state.user = action.payload.currentUser;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = action.payload.currentUser;
        state.isAuthenticated = action.payload.isAuthenticated;
      });
  },
});

export const selectCurrentUser = (state: AppState) => state.currentUser.user!;

export const getCurrentUser = (state: AppState) => state.currentUser.user;

export const selectIsAuthenticated = (state: AppState) =>
  state.currentUser.isAuthenticated;

export default userSlice.reducer;
