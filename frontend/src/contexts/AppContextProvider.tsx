import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Project,
  DBConnection,
  DBDataModel,
  DBQuery,
  Tab,
  DBQueryLog,
  DBQueryData,
} from "../data/models";
import { TabType } from "../data/defaults";
import storage from "../data/storage";
import apiService from "../network/apiService";

// State interfaces
export interface CurrentUserState {
  user?: User;
  isAuthenticated: boolean | null;
}

export interface ProjectState {
  projects: Array<Project>;
  isFetching: boolean;
  dbConnectionsInProject: Array<DBConnection>;
}

export interface DBConnectionState {
  dbConnection?: DBConnection;
  dbDataModels: DBDataModel[];
  dbQueries: DBQuery[];
  isDBConnected: boolean | undefined;
  isFetchingDBDataModels: boolean;
  isDBDataModelsFetched: boolean;
  isDBQueriesFetched: boolean;
}

export interface TabState {
  tabs: Array<Tab>;
  activeTabId: string | undefined;
}

export interface QueryDataModelState {
  [tabId: string]: {
    queryData: DBQueryData | undefined;
    dataModel: DBDataModel | undefined;
    isFetching: {
      data: boolean;
      model: boolean;
    };
  };
}

export interface DBQueryState {
  [tabId: string]: {
    dbQuery: DBQuery | undefined;
  };
}

export interface DBHistoryState {
  dbQueryLogs: DBQueryLog[];
  dbQueryLogsNext: number | undefined;
}

export interface ConfigState {
  isShowingSidebar: boolean | null;
}

export interface OutputBlock {
  text: string;
  cmd: boolean;
}

export interface ConsoleState {
  blocks: Array<OutputBlock>;
  dbConnectionId: string | undefined;
}

export interface APIState {
  version: string;
}

// Combined app state
export interface AppState {
  currentUser: CurrentUserState;
  projects: ProjectState;
  dbConnection: DBConnectionState;
  tabs: TabState;
  dataModel: QueryDataModelState;
  dbQuery: DBQueryState;
  dbHistory: DBHistoryState;
  config: ConfigState;
  console: ConsoleState;
  api: APIState;
}

// Action types
type AppAction =
  // Current User Actions
  | { type: "SET_USER"; payload: { user?: User; isAuthenticated: boolean } }
  | { type: "CLEAR_USER" }

  // Project Actions
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_PROJECT_FETCHING"; payload: boolean }
  | { type: "SET_DB_CONNECTIONS_IN_PROJECT"; payload: DBConnection[] }
  | { type: "DELETE_DB_CONNECTION_IN_PROJECT"; payload: string }

  // DB Connection Actions
  | { type: "SET_DB_CONNECTION"; payload: DBConnection | undefined }
  | { type: "SET_DB_CONNECTED"; payload: boolean }
  | { type: "SET_DB_DATA_MODELS"; payload: DBDataModel[] }
  | { type: "SET_DB_QUERIES"; payload: DBQuery[] }
  | { type: "ADD_DB_QUERY"; payload: DBQuery }
  | { type: "UPDATE_DB_QUERY"; payload: DBQuery }
  | { type: "DELETE_DB_QUERY"; payload: string }
  | { type: "SET_FETCHING_DB_DATA_MODELS"; payload: boolean }
  | { type: "RESET_DB_DATA_MODELS" }

  // Tab Actions
  | { type: "SET_TABS"; payload: Tab[] }
  | { type: "ADD_TAB"; payload: Tab }
  | { type: "UPDATE_TAB"; payload: Tab }
  | { type: "DELETE_TAB"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string | undefined }

  // Data Model Actions
  | {
      type: "SET_QUERY_DATA";
      payload: { tabId: string; data: DBQueryData | undefined };
    }
  | {
      type: "SET_DATA_MODEL";
      payload: { tabId: string; dataModel: DBDataModel | undefined };
    }
  | { type: "SET_FETCHING_DATA"; payload: { tabId: string; fetching: boolean } }
  | {
      type: "SET_FETCHING_MODEL";
      payload: { tabId: string; fetching: boolean };
    }

  // DB Query Actions
  | {
      type: "SET_DB_QUERY";
      payload: { tabId: string; dbQuery: DBQuery | undefined };
    }

  // History Actions
  | {
      type: "ADD_QUERY_LOGS";
      payload: { logs: DBQueryLog[]; next: number | undefined };
    }
  | { type: "RESET_DB_HISTORY" }

  // Config Actions
  | { type: "SET_CONFIG"; payload: Partial<ConfigState> }

  // Console Actions
  | { type: "ADD_CONSOLE_BLOCK"; payload: OutputBlock }
  | { type: "INIT_CONSOLE"; payload: string }
  | { type: "RESET_CONSOLE" }

  // API Actions
  | { type: "SET_API_VERSION"; payload: string }

  // Reset Actions
  | { type: "RESET_ALL" };

// Initial state
const initialState: AppState = {
  currentUser: {
    isAuthenticated: null,
  },
  projects: {
    projects: [],
    isFetching: false,
    dbConnectionsInProject: [],
  },
  dbConnection: {
    dbConnection: undefined,
    dbDataModels: [],
    dbQueries: [],
    isDBConnected: undefined,
    isFetchingDBDataModels: false,
    isDBDataModelsFetched: false,
    isDBQueriesFetched: false,
  },
  tabs: {
    tabs: [],
    activeTabId: undefined,
  },
  dataModel: {},
  dbQuery: {},
  dbHistory: {
    dbQueryLogs: [],
    dbQueryLogsNext: undefined,
  },
  config: {
    isShowingSidebar: null,
  },
  console: {
    blocks: [],
    dbConnectionId: undefined,
  },
  api: {
    version: "",
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        currentUser: {
          user: action.payload.user,
          isAuthenticated: action.payload.isAuthenticated,
        },
      };

    case "CLEAR_USER":
      return {
        ...initialState,
        currentUser: {
          user: undefined,
          isAuthenticated: false,
        },
      };

    case "SET_PROJECTS":
      return {
        ...state,
        projects: {
          ...state.projects,
          projects: action.payload,
          isFetching: false,
        },
      };

    case "ADD_PROJECT":
      return {
        ...state,
        projects: {
          ...state.projects,
          projects: [...state.projects.projects, action.payload],
        },
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: {
          ...state.projects,
          projects: state.projects.projects.filter(
            (p) => p.id !== action.payload,
          ),
        },
      };

    case "SET_PROJECT_FETCHING":
      return {
        ...state,
        projects: {
          ...state.projects,
          isFetching: action.payload,
        },
      };

    case "SET_DB_CONNECTIONS_IN_PROJECT":
      return {
        ...state,
        projects: {
          ...state.projects,
          dbConnectionsInProject: action.payload,
        },
      };

    case "DELETE_DB_CONNECTION_IN_PROJECT":
      return {
        ...state,
        projects: {
          ...state.projects,
          dbConnectionsInProject: state.projects.dbConnectionsInProject.filter(
            (conn) => conn.id !== action.payload,
          ),
        },
      };

    case "SET_DB_CONNECTION":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          dbConnection: action.payload,
        },
      };

    case "SET_DB_CONNECTED":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          isDBConnected: action.payload,
        },
      };

    case "SET_DB_DATA_MODELS":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          dbDataModels: action.payload,
          isDBDataModelsFetched: true,
          isFetchingDBDataModels: false,
        },
      };

    case "SET_DB_QUERIES":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          dbQueries: action.payload,
          isDBQueriesFetched: true,
        },
      };

    case "ADD_DB_QUERY":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          dbQueries: [...state.dbConnection.dbQueries, action.payload],
        },
      };

    case "UPDATE_DB_QUERY":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          dbQueries: state.dbConnection.dbQueries.map((q) =>
            q.id === action.payload.id ? action.payload : q,
          ),
        },
      };

    case "DELETE_DB_QUERY":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          dbQueries: state.dbConnection.dbQueries.filter(
            (q) => q.id !== action.payload,
          ),
        },
      };

    case "SET_FETCHING_DB_DATA_MODELS":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          isFetchingDBDataModels: action.payload,
        },
      };

    case "RESET_DB_DATA_MODELS":
      return {
        ...state,
        dbConnection: {
          ...state.dbConnection,
          isDBDataModelsFetched: false,
          dbDataModels: [],
        },
      };

    case "SET_TABS":
      return {
        ...state,
        tabs: {
          tabs: action.payload,
          activeTabId: action.payload[0]?.id,
        },
      };

    case "ADD_TAB":
      return {
        ...state,
        tabs: {
          tabs: [...state.tabs.tabs, action.payload],
          activeTabId: action.payload.id,
        },
      };

    case "UPDATE_TAB":
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map((t) =>
            t.id === action.payload.id ? action.payload : t,
          ),
        },
      };

    case "DELETE_TAB":
      const filteredTabs = state.tabs.tabs.filter(
        (t) => t.id !== action.payload,
      );
      let newActiveTabId = state.tabs.activeTabId;

      if (
        state.tabs.activeTabId === action.payload &&
        filteredTabs.length > 0
      ) {
        const currentIndex = state.tabs.tabs.findIndex(
          (t) => t.id === action.payload,
        );
        newActiveTabId =
          filteredTabs[currentIndex === 0 ? 0 : currentIndex - 1]?.id;
      }

      return {
        ...state,
        tabs: {
          tabs: filteredTabs,
          activeTabId: newActiveTabId,
        },
      };

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        tabs: {
          ...state.tabs,
          activeTabId: action.payload,
        },
      };

    case "SET_QUERY_DATA":
      const { tabId: queryTabId, data } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          [queryTabId]: {
            ...state.dataModel[queryTabId],
            queryData: data,
            isFetching: {
              ...(state.dataModel[queryTabId]?.isFetching || {
                data: false,
                model: false,
              }),
              data: false,
            },
          },
        },
      };

    case "SET_DATA_MODEL":
      const { tabId: modelTabId, dataModel } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          [modelTabId]: {
            ...state.dataModel[modelTabId],
            dataModel: dataModel,
            isFetching: {
              ...(state.dataModel[modelTabId]?.isFetching || {
                data: false,
                model: false,
              }),
              model: false,
            },
          },
        },
      };

    case "SET_FETCHING_DATA":
      const { tabId: fetchDataTabId, fetching: dataFetching } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          [fetchDataTabId]: {
            ...state.dataModel[fetchDataTabId],
            isFetching: {
              ...(state.dataModel[fetchDataTabId]?.isFetching || {
                data: false,
                model: false,
              }),
              data: dataFetching,
            },
          },
        },
      };

    case "SET_FETCHING_MODEL":
      const { tabId: fetchModelTabId, fetching: modelFetching } =
        action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          [fetchModelTabId]: {
            ...state.dataModel[fetchModelTabId],
            isFetching: {
              ...(state.dataModel[fetchModelTabId]?.isFetching || {
                data: false,
                model: false,
              }),
              model: modelFetching,
            },
          },
        },
      };

    case "SET_DB_QUERY":
      const { tabId: dbQueryTabId, dbQuery } = action.payload;
      return {
        ...state,
        dbQuery: {
          ...state.dbQuery,
          [dbQueryTabId]: {
            dbQuery: dbQuery,
          },
        },
      };

    case "ADD_QUERY_LOGS":
      return {
        ...state,
        dbHistory: {
          dbQueryLogs: [...state.dbHistory.dbQueryLogs, ...action.payload.logs],
          dbQueryLogsNext: action.payload.next,
        },
      };

    case "RESET_DB_HISTORY":
      return {
        ...state,
        dbHistory: {
          dbQueryLogs: [],
          dbQueryLogsNext: undefined,
        },
      };

    case "SET_CONFIG":
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        },
      };

    case "ADD_CONSOLE_BLOCK":
      return {
        ...state,
        console: {
          ...state.console,
          blocks: [...state.console.blocks, action.payload],
        },
      };

    case "INIT_CONSOLE":
      const shouldResetConsole =
        state.console.dbConnectionId &&
        state.console.dbConnectionId !== action.payload;

      return {
        ...state,
        console: {
          blocks: shouldResetConsole ? [] : state.console.blocks,
          dbConnectionId: action.payload,
        },
      };

    case "RESET_CONSOLE":
      return {
        ...state,
        console: {
          blocks: [],
          dbConnectionId: undefined,
        },
      };

    case "SET_API_VERSION":
      return {
        ...state,
        api: {
          version: action.payload,
        },
      };

    case "RESET_ALL":
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

// Provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
