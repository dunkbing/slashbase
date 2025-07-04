import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import type { DBConnection } from "../data/models";
import apiService from "../network/apiService";
import type { AddDBConnPayload } from "../network/payloads";

// Types
interface DBConnectionsState {
  dbConnections: Array<DBConnection>;
  isFetching: boolean;
  error: string | null;
}

type DBConnectionsAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      payload: { dbConnections: Array<DBConnection>; force?: boolean };
    }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_CONNECTION"; payload: DBConnection }
  | { type: "RESET" };

interface DBConnectionsContextType {
  state: DBConnectionsState;
  getAllDBConnections: (force?: boolean) => Promise<void>;
  addNewDBConn: (payload: AddDBConnPayload) => Promise<DBConnection>;
  testNewDBConn: (payload: AddDBConnPayload) => Promise<boolean>;
  reset: () => void;
}

// Initial state
const initialState: DBConnectionsState = {
  dbConnections: [],
  isFetching: false,
  error: null,
};

// Reducer
function dbConnectionsReducer(
  state: DBConnectionsState,
  action: DBConnectionsAction,
): DBConnectionsState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case "FETCH_SUCCESS": {
      const dbConnections = action.payload.force
        ? action.payload.dbConnections
        : [...state.dbConnections, ...action.payload.dbConnections];
      const uniqueConnections = dbConnections.filter(
        (obj, index, self) => index === self.findIndex((o) => o.id === obj.id),
      );
      return {
        ...state,
        isFetching: false,
        dbConnections: uniqueConnections,
        error: null,
      };
    }
    case "FETCH_ERROR":
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    case "ADD_CONNECTION":
      return {
        ...state,
        dbConnections: [...state.dbConnections, action.payload],
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Context
const DBConnectionsContext = createContext<
  DBConnectionsContextType | undefined
>(undefined);

// Provider component
interface DBConnectionsProviderProps {
  children: ReactNode;
}

export function DBConnectionsProvider({
  children,
}: DBConnectionsProviderProps) {
  const [state, dispatch] = useReducer(dbConnectionsReducer, initialState);

  const getAllDBConnections = useCallback(
    async (force = false) => {
      if (!force && state.dbConnections.length > 0 && !state.isFetching) {
        return;
      }

      dispatch({ type: "FETCH_START" });

      try {
        const result = await apiService.getAllDBConnections();
        console.log("getAllDBConnections", result);
        const dbConnections = result.success ? result.data : [];

        dispatch({
          type: "FETCH_SUCCESS",
          payload: { dbConnections, force },
        });
      } catch (error) {
        dispatch({
          type: "FETCH_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to fetch connections",
        });
      }
    },
    [state.dbConnections.length, state.isFetching],
  );

  useEffect(() => {
    void getAllDBConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNewDBConn = useCallback(
    async (payload: AddDBConnPayload): Promise<DBConnection> => {
      const response = await apiService.addNewDBConn({
        ...payload,
        isTest: false,
      });

      if (response.success && response.data) {
        dispatch({ type: "ADD_CONNECTION", payload: response.data });
        return response.data;
      } else {
        throw new Error(response.error || "Failed to add database connection");
      }
    },
    [],
  );

  const testNewDBConn = useCallback(
    async (payload: AddDBConnPayload): Promise<boolean> => {
      const response = await apiService.addNewDBConn({
        ...payload,
        isTest: true,
      });

      if (response.success) {
        return true;
      } else {
        throw new Error(response.error || "Failed to test database connection");
      }
    },
    [],
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value = {
    state,
    getAllDBConnections,
    addNewDBConn,
    testNewDBConn,
    reset,
  };

  return (
    <DBConnectionsContext.Provider value={value}>
      {children}
    </DBConnectionsContext.Provider>
  );
}

// Hook to use the context
export function useDBConnections() {
  const context = useContext(DBConnectionsContext);
  if (context === undefined) {
    throw new Error(
      "useDBConnections must be used within a DBConnectionsProvider",
    );
  }
  return context;
}

// Selector functions (similar to Redux selectors)
export function useAllDBConnections(): Array<DBConnection> {
  const { state } = useDBConnections();
  return state.dbConnections;
}

export function useDBConnectionsLoading(): boolean {
  const { state } = useDBConnections();
  return state.isFetching;
}
