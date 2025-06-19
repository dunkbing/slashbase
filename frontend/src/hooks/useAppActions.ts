import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../contexts/AppContextProvider";
import Constants from "../constants";
import { DBConnection, Project, Tab } from "../data/models";
import { TabType } from "../data/defaults";
import storage from "../data/storage";
import apiService from "../network/apiService";

export function useAppActions() {
  const { state, dispatch } = useAppContext();

  // Current User Actions
  const loginUser = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiService.loginUser(email, password);
        if (response.success) {
          await storage.loginCurrentUser(response.data.user);
          dispatch({
            type: "SET_USER",
            payload: {
              user: response.data.user,
              isAuthenticated: true,
            },
          });
          return { success: true };
        } else {
          return { success: false, error: response.error };
        }
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    [dispatch],
  );

  const getUser = useCallback(async () => {
    const isAuthenticated = await apiService.isUserAuthenticated();
    const currentUser = await storage.getCurrentUser();
    dispatch({
      type: "SET_USER",
      payload: {
        user: currentUser || undefined,
        isAuthenticated,
      },
    });
  }, [dispatch]);

  const editUser = useCallback(
    async (name: string, profileImageUrl: string) => {
      try {
        const response = await apiService.editUser(name, profileImageUrl);
        if (response.success) {
          await storage.updateCurrentUser(response.data);
          dispatch({
            type: "SET_USER",
            payload: {
              user: response.data,
              isAuthenticated: state.currentUser.isAuthenticated ?? true,
            },
          });
          return { success: true };
        } else {
          return { success: false, error: response.error };
        }
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    [dispatch, state.currentUser.isAuthenticated],
  );

  const updateUser = useCallback(
    async (user: any) => {
      await storage.updateCurrentUser(user);
      dispatch({
        type: "SET_USER",
        payload: {
          user: user,
          isAuthenticated: state.currentUser.isAuthenticated ?? true,
        },
      });
    },
    [dispatch, state.currentUser.isAuthenticated],
  );

  const logoutUser = useCallback(async () => {
    await apiService.logoutUser();
    clearLogin();
  }, []);

  const clearLogin = useCallback(async () => {
    await storage.logoutUser();
    dispatch({ type: "RESET_ALL" });
  }, [dispatch]);

  // Project Actions
  const getProjects = useCallback(async () => {
    const isFetched = state.projects.projects.length > 0;
    if (isFetched || state.projects.isFetching) {
      return;
    }

    dispatch({ type: "SET_PROJECT_FETCHING", payload: true });

    const result = await apiService.getProjects();
    const projects = result.success ? result.data : [];

    dispatch({ type: "SET_PROJECTS", payload: projects });
  }, [state.projects.projects.length, state.projects.isFetching, dispatch]);

  const createNewProject = useCallback(
    async (projectName: string) => {
      if (projectName.trim().length === 0) {
        toast.error("Project Name cannot be empty!");
        return { success: false, project: null };
      }

      const result = await apiService.createNewProject(projectName);
      if (result.success) {
        dispatch({ type: "ADD_PROJECT", payload: result.data });
        return { success: true, project: result.data };
      }

      return { success: false, project: null };
    },
    [dispatch],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      const result = await apiService.deleteProject(projectId);
      if (result.success) {
        dispatch({ type: "DELETE_PROJECT", payload: projectId });
        return { success: true };
      }
      return { success: false };
    },
    [dispatch],
  );

  const getDBConnectionsInProjects = useCallback(
    async (projectId: string) => {
      const result = await apiService.getDBConnectionsByProject(projectId);
      const dbConnections = result.success ? result.data : [];
      dispatch({
        type: "SET_DB_CONNECTIONS_IN_PROJECT",
        payload: dbConnections,
      });
    },
    [dispatch],
  );

  const deleteDBConnectionInProject = useCallback(
    async (dbConnId: string) => {
      const result = await apiService.deleteDBConnection(dbConnId);
      if (result.success) {
        dispatch({
          type: "DELETE_DB_CONNECTION_IN_PROJECT",
          payload: dbConnId,
        });
        return { success: true };
      }
      return { success: false };
    },
    [dispatch],
  );

  // DB Connection Actions
  const getDBConnection = useCallback(
    async (dbConnId: string) => {
      if (state.dbConnection.dbConnection?.id === dbConnId) {
        return { dbConnection: state.dbConnection.dbConnection, new: false };
      }

      const result = await apiService.getSingleDBConnection(dbConnId);
      if (result.success) {
        // Reset related data when switching connections
        dispatch({ type: "SET_DB_CONNECTION", payload: result.data });
        dispatch({ type: "SET_DB_DATA_MODELS", payload: [] });
        dispatch({ type: "SET_DB_QUERIES", payload: [] });
        dispatch({ type: "RESET_DB_DATA_MODELS" });

        return { dbConnection: result.data, new: true };
      } else {
        throw new Error(result.error);
      }
    },
    [state.dbConnection.dbConnection?.id, dispatch],
  );

  const checkConnection = useCallback(async () => {
    if (!state.dbConnection.dbConnection) {
      throw new Error("no active db connection");
    }

    const result = await apiService.checkConnection(
      state.dbConnection.dbConnection.id,
    );
    dispatch({ type: "SET_DB_CONNECTED", payload: result.success });

    return { result: result.success };
  }, [state.dbConnection.dbConnection, dispatch]);

  const getDBDataModels = useCallback(
    async (dbConnId: string) => {
      if (state.dbConnection.isDBDataModelsFetched) {
        return;
      }

      dispatch({ type: "SET_FETCHING_DB_DATA_MODELS", payload: true });

      const result = await apiService.getDBDataModelsByConnectionId(dbConnId);
      if (result.success) {
        dispatch({ type: "SET_DB_DATA_MODELS", payload: result.data });
      } else {
        dispatch({ type: "SET_FETCHING_DB_DATA_MODELS", payload: false });
        throw new Error(result.error);
      }
    },
    [state.dbConnection.isDBDataModelsFetched, dispatch],
  );

  const getDBQueries = useCallback(
    async (dbConnId: string) => {
      if (state.dbConnection.isDBQueriesFetched) {
        return;
      }

      const result = await apiService.getDBQueriesInDBConn(dbConnId);
      if (result.success) {
        dispatch({ type: "SET_DB_QUERIES", payload: result.data });
      } else {
        throw new Error(result.error);
      }
    },
    [state.dbConnection.isDBQueriesFetched, dispatch],
  );

  const saveDBQuery = useCallback(
    async (dbConnId: string, queryId: string, name: string, query: string) => {
      const result = await apiService.saveDBQuery(
        dbConnId,
        name,
        query,
        queryId,
      );
      if (result.success) {
        const existingQuery = state.dbConnection.dbQueries.find(
          (q) => q.id === result.data.id,
        );
        if (existingQuery) {
          dispatch({ type: "UPDATE_DB_QUERY", payload: result.data });
        } else {
          dispatch({ type: "ADD_DB_QUERY", payload: result.data });
        }
        return { success: true, dbQuery: result.data };
      } else {
        throw new Error(result.error);
      }
    },
    [state.dbConnection.dbQueries, dispatch],
  );

  const deleteDBQuery = useCallback(
    async (queryId: string) => {
      const result = await apiService.deleteDBQuery(queryId);
      if (result.success) {
        dispatch({ type: "DELETE_DB_QUERY", payload: queryId });
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    },
    [dispatch],
  );

  const resetDBDataModels = useCallback(() => {
    dispatch({ type: "RESET_DB_DATA_MODELS" });
  }, [dispatch]);

  // Tab Actions
  const createTab = useCallback(
    async (dbConnId: string, tabType: TabType, metadata?: any) => {
      const currentTabs = state.tabs.tabs.filter((t) => t.type === tabType);

      let mSchema = "";
      let mName = "";
      let queryId = "";
      let query = "";

      if (tabType === TabType.DATA || tabType === TabType.MODEL) {
        mSchema = metadata?.schema || "";
        mName = metadata?.name || "";
        const tab = currentTabs.find(
          (t) => t.metadata.schema === mSchema && t.metadata.name === mName,
        );
        if (tab) {
          dispatch({ type: "SET_ACTIVE_TAB", payload: tab.id });
          return { activeTabId: tab.id };
        }
      } else if (tabType === TabType.QUERY) {
        queryId = metadata?.queryId || "";
        query = metadata?.query || "";
        const tab = currentTabs.find((t) => t.metadata.queryId === queryId);
        if (queryId !== "new" && tab) {
          dispatch({ type: "SET_ACTIVE_TAB", payload: tab.id });
          return { activeTabId: tab.id };
        }
      } else {
        const tab = currentTabs.find((t) => t.type === tabType);
        if (tab) {
          dispatch({ type: "SET_ACTIVE_TAB", payload: tab.id });
          return { activeTabId: tab.id };
        }
      }

      const result = await apiService.createTab(
        dbConnId,
        tabType,
        mSchema,
        mName,
        queryId,
        query,
      );
      if (result.success) {
        dispatch({ type: "ADD_TAB", payload: result.data });
        return { tab: result.data, activeTabId: result.data.id };
      } else {
        throw new Error(result.error);
      }
    },
    [state.tabs.tabs, dispatch],
  );

  const updateActiveTab = useCallback(
    async (tabType: TabType, metadata: object) => {
      if (!state.tabs.activeTabId || !state.dbConnection.dbConnection) {
        throw new Error("no active tab or db connection");
      }

      const result = await apiService.updateTab(
        state.dbConnection.dbConnection.id,
        state.tabs.activeTabId,
        tabType,
        metadata,
      );

      if (result.success) {
        dispatch({ type: "UPDATE_TAB", payload: result.data });
        return { tab: result.data };
      } else {
        throw new Error(result.error);
      }
    },
    [state.tabs.activeTabId, state.dbConnection.dbConnection, dispatch],
  );

  const getTabs = useCallback(
    async (dbConnId: string) => {
      const result = await apiService.getTabsByDBConnection(dbConnId);
      if (result.success) {
        dispatch({ type: "SET_TABS", payload: result.data });
        return { tabs: result.data, activeTabId: result.data[0]?.id };
      } else {
        throw new Error(result.error);
      }
    },
    [dispatch],
  );

  const closeTab = useCallback(
    async (dbConnId: string, tabId: string) => {
      const tab = state.tabs.tabs.find((t) => t.id === tabId);
      if (!tab) {
        throw new Error("tab not open");
      }

      const result = await apiService.closeTab(dbConnId, tabId);
      if (result.success) {
        if (tab.type === TabType.CONSOLE) {
          dispatch({ type: "RESET_CONSOLE" });
        }
        dispatch({ type: "DELETE_TAB", payload: tabId });
        return { tabId: tabId };
      } else {
        throw new Error(result.error);
      }
    },
    [state.tabs.tabs, dispatch],
  );

  const setActiveTab = useCallback(
    (tabId: string) => {
      dispatch({ type: "SET_ACTIVE_TAB", payload: tabId });
    },
    [dispatch],
  );

  // Data Model Actions
  const getDBDataInDataModel = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      queryLimit: number;
      queryOffset: number;
      isFirstFetch: boolean;
      queryFilter?: any;
      querySort?: any;
      tabId: string;
    }) => {
      const currentTabData = state.dataModel[params.tabId];
      if (currentTabData?.isFetching.data) {
        return;
      }

      dispatch({
        type: "SET_FETCHING_DATA",
        payload: { tabId: params.tabId, fetching: true },
      });

      const result = await apiService.getDBDataInDataModel(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.queryLimit,
        params.queryOffset,
        params.isFirstFetch,
        params.queryFilter,
        params.querySort,
      );

      if (result.success) {
        dispatch({
          type: "SET_QUERY_DATA",
          payload: { tabId: params.tabId, data: result.data },
        });
        return { data: result.data };
      } else {
        dispatch({
          type: "SET_FETCHING_DATA",
          payload: { tabId: params.tabId, fetching: false },
        });
        throw new Error(result.error);
      }
    },
    [state.dataModel, dispatch],
  );

  const getSingleDataModel = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      tabId: string;
    }) => {
      dispatch({
        type: "SET_FETCHING_MODEL",
        payload: { tabId: params.tabId, fetching: true },
      });

      const result = await apiService.getDBSingleDataModelByConnectionId(
        params.dbConnectionId,
        params.schemaName,
        params.name,
      );

      if (result.success) {
        dispatch({
          type: "SET_DATA_MODEL",
          payload: { tabId: params.tabId, dataModel: result.data },
        });
        return { data: result.data };
      } else {
        dispatch({
          type: "SET_FETCHING_MODEL",
          payload: { tabId: params.tabId, fetching: false },
        });
        throw new Error(result.error);
      }
    },
    [dispatch],
  );

  // Additional data model actions
  const addDBData = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      data: any;
    }) => {
      return await apiService.addDBData(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.data,
      );
    },
    [],
  );

  const addDBDataModelField = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      fieldName: string;
      dataType: string;
    }) => {
      return await apiService.addDBSingleDataModelField(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.fieldName,
        params.dataType,
      );
    },
    [],
  );

  const deleteDBDataModelField = useCallback(
    async (params: {
      tabId: string;
      dbConnectionId: string;
      schemaName: string;
      name: string;
      fieldName: string;
    }) => {
      return await apiService.deleteDBSingleDataModelField(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.fieldName,
      );
    },
    [],
  );

  const addDBDataModelIndex = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      indexName: string;
      fieldNames: string[];
      isUnique: boolean;
    }) => {
      return await apiService.addDBSingleDataModelIndex(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.indexName,
        params.fieldNames,
        params.isUnique,
      );
    },
    [],
  );

  const deleteDBDataModelIndex = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      indexName: string;
    }) => {
      return await apiService.deleteDBSingleDataModelIndex(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.indexName,
      );
    },
    [],
  );

  const updateDBSingleData = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      id: string;
      columnName: string;
      newValue: any;
    }) => {
      return await apiService.updateDBSingleData(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.id,
        params.columnName,
        params.newValue,
      );
    },
    [],
  );

  const deleteDBData = useCallback(
    async (params: {
      dbConnectionId: string;
      schemaName: string;
      name: string;
      selectedIDs: string[];
    }) => {
      return await apiService.deleteDBData(
        params.dbConnectionId,
        params.schemaName,
        params.name,
        params.selectedIDs,
      );
    },
    [],
  );

  // DB Query Actions
  const getDBQuery = useCallback(
    async (queryId: string, tabId: string) => {
      const result = await apiService.getSingleDBQuery(queryId);
      if (result.success) {
        dispatch({
          type: "SET_DB_QUERY",
          payload: { tabId, dbQuery: result.data },
        });
      }
      return result;
    },
    [dispatch],
  );

  const runQuery = useCallback(
    async (dbConnectionId: string, query: string) => {
      return await apiService.runQuery(dbConnectionId, query);
    },
    [],
  );

  const setDBQuery = useCallback(
    (tabId: string, dbQuery: any) => {
      dispatch({
        type: "SET_DB_QUERY",
        payload: { tabId, dbQuery },
      });
    },
    [dispatch],
  );

  const setQueryData = useCallback(
    (tabId: string, data: any) => {
      dispatch({
        type: "SET_QUERY_DATA",
        payload: { tabId, data },
      });
    },
    [dispatch],
  );

  // History Actions
  const getDBQueryLogs = useCallback(
    async (dbConnId: string) => {
      const result = await apiService.getDBHistory(
        dbConnId,
        state.dbHistory.dbQueryLogsNext,
      );
      if (result.success) {
        dispatch({
          type: "ADD_QUERY_LOGS",
          payload: {
            logs: result.data.list,
            next: result.data.next,
          },
        });
      }
      return result;
    },
    [state.dbHistory.dbQueryLogsNext, dispatch],
  );

  const resetDBQueryLogs = useCallback(() => {
    dispatch({ type: "RESET_DB_HISTORY" });
  }, [dispatch]);

  // Config Actions
  const getConfig = useCallback(async () => {
    const isShowingSidebar = await storage.isShowingSidebar();
    dispatch({
      type: "SET_CONFIG",
      payload: { isShowingSidebar },
    });
  }, [dispatch]);

  const setIsShowingSidebar = useCallback(
    (isShowing: boolean) => {
      dispatch({
        type: "SET_CONFIG",
        payload: { isShowingSidebar: isShowing },
      });
      storage.setIsShowingSidebar(isShowing);
    },
    [dispatch],
  );

  // Console Actions
  const runConsoleCmd = useCallback(
    async (dbConnId: string, cmdString: string) => {
      if (cmdString === "") {
        throw new Error("empty command");
      }

      // Add command to console first
      dispatch({
        type: "ADD_CONSOLE_BLOCK",
        payload: { text: cmdString, cmd: true },
      });

      const result = await apiService.runConsoleCommand(dbConnId, cmdString);
      if (result.success) {
        dispatch({
          type: "ADD_CONSOLE_BLOCK",
          payload: { text: result.data, cmd: false },
        });
        return { text: result.data };
      } else {
        throw new Error(result.error);
      }
    },
    [dispatch],
  );

  const initConsole = useCallback(
    (dbConnectionId: string) => {
      dispatch({ type: "INIT_CONSOLE", payload: dbConnectionId });
    },
    [dispatch],
  );

  // API Actions
  const healthCheck = useCallback(async () => {
    const response = await apiService.getHealthCheck();
    dispatch({ type: "SET_API_VERSION", payload: response.version });
    return { version: response.version };
  }, [dispatch]);

  return {
    // Current User
    loginUser,
    getUser,
    editUser,
    updateUser,
    logoutUser,
    clearLogin,

    // Projects
    getProjects,
    createNewProject,
    deleteProject,
    getDBConnectionsInProjects,
    deleteDBConnectionInProject,

    // DB Connection
    getDBConnection,
    checkConnection,
    getDBDataModels,
    getDBQueries,
    saveDBQuery,
    deleteDBQuery,
    resetDBDataModels,

    // Tabs
    createTab,
    updateActiveTab,
    getTabs,
    closeTab,
    setActiveTab,

    // Data Model
    getDBDataInDataModel,
    getSingleDataModel,
    addDBData,
    updateDBSingleData,
    deleteDBData,
    addDBDataModelField,
    deleteDBDataModelField,
    addDBDataModelIndex,
    deleteDBDataModelIndex,

    // DB Query
    getDBQuery,
    runQuery,
    setDBQuery,
    setQueryData,

    // History
    getDBQueryLogs,
    resetDBQueryLogs,

    // Config
    getConfig,
    setIsShowingSidebar,

    // Console
    runConsoleCmd,
    initConsole,

    // API
    healthCheck,
  };
}
