import {
  type Action,
  type ThunkAction,
  configureStore,
} from "@reduxjs/toolkit";
import apiReducer from "./apiSlice";
import configReducer from "./configSlice";
import consoleReducer from "./consoleSlice";
import currentUserReducer from "./currentUserSlice";
import dataModelReducer from "./dataModelSlice";
import dbConnectionReducer from "./dbConnectionSlice";
import dbHistoryReducer from "./dbHistorySlice";
import dbQueryReducer from "./dbQuerySlice";
import projectsReducer from "./projectsSlice";
import tabsReducer from "./tabsSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      api: apiReducer,
      currentUser: currentUserReducer,
      projects: projectsReducer,
      dbConnection: dbConnectionReducer,
      tabs: tabsReducer,
      dataModel: dataModelReducer,
      dbQuery: dbQueryReducer,
      dbHistory: dbHistoryReducer,
      config: configReducer,
      console: consoleReducer,
    },
  });
}

const store = makeStore();

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
