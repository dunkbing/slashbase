import { useMemo } from "react";
import { useAppContext } from "../contexts/AppContextProvider";
import Constants from "../constants";

export function useAppSelectors() {
  const { state } = useAppContext();

  // Current User Selectors
  const selectCurrentUser = useMemo(
    () => state.currentUser.user!,
    [state.currentUser.user],
  );
  const getCurrentUser = useMemo(
    () => state.currentUser.user,
    [state.currentUser.user],
  );
  const selectIsAuthenticated = useMemo(
    () => state.currentUser.isAuthenticated,
    [state.currentUser.isAuthenticated],
  );

  // Project Selectors
  const selectProjects = useMemo(
    () => state.projects.projects,
    [state.projects.projects],
  );

  const selectCurrentProject = useMemo(
    () =>
      state.projects.projects.find(
        (x) => x.id === state.dbConnection.dbConnection?.projectId,
      ),
    [state.projects.projects, state.dbConnection.dbConnection?.projectId],
  );

  const selectDBConnectionsInProject = useMemo(
    () => state.projects.dbConnectionsInProject,
    [state.projects.dbConnectionsInProject],
  );

  const selectProjectMemberPermissions = useMemo(() => {
    const allPermissions = state.projects.projects.find(
      (x) => x.id === state.dbConnection.dbConnection?.projectId,
    )?.currentMember?.role.permissions;

    const permission = {
      readOnly: allPermissions?.find(
        (x) => x.name === Constants.ROLES_PERMISSIONS.READ_ONLY,
      )?.value
        ? true
        : false,
    };

    return permission;
  }, [state.projects.projects, state.dbConnection.dbConnection?.projectId]);

  // DB Connection Selectors
  const selectDBConnection = useMemo(
    () => state.dbConnection.dbConnection,
    [state.dbConnection.dbConnection],
  );

  const selectIsDBConnected = useMemo(
    () => state.dbConnection.isDBConnected,
    [state.dbConnection.isDBConnected],
  );

  const selectDBDataModels = useMemo(
    () => state.dbConnection.dbDataModels,
    [state.dbConnection.dbDataModels],
  );

  const selectDBQueries = useMemo(
    () => state.dbConnection.dbQueries,
    [state.dbConnection.dbQueries],
  );

  const selectIsFetchingDBDataModels = useMemo(
    () => state.dbConnection.isFetchingDBDataModels,
    [state.dbConnection.isFetchingDBDataModels],
  );

  // Tab Selectors
  const selectTabs = useMemo(
    () =>
      state.tabs.tabs.map((t) => ({
        ...t,
        isActive: t.id === state.tabs.activeTabId,
      })),
    [state.tabs.tabs, state.tabs.activeTabId],
  );

  const selectActiveTab = useMemo(
    () => state.tabs.tabs.find((t) => t.id === state.tabs.activeTabId)!,
    [state.tabs.tabs, state.tabs.activeTabId],
  );

  // Data Model Selectors
  const selectQueryData = useMemo(
    () =>
      state.tabs.activeTabId
        ? state.dataModel[state.tabs.activeTabId]?.queryData
        : undefined,
    [state.tabs.activeTabId, state.dataModel],
  );

  const selectIsFetchingQueryData = useMemo(
    () =>
      state.tabs.activeTabId
        ? state.dataModel[state.tabs.activeTabId]?.isFetching.data || false
        : false,
    [state.tabs.activeTabId, state.dataModel],
  );

  const selectSingleDataModel = useMemo(
    () =>
      state.tabs.activeTabId
        ? state.dataModel[state.tabs.activeTabId]?.dataModel
        : undefined,
    [state.tabs.activeTabId, state.dataModel],
  );

  const selectIsFetchingDataModel = useMemo(
    () =>
      state.tabs.activeTabId
        ? state.dataModel[state.tabs.activeTabId]?.isFetching.model || false
        : false,
    [state.tabs.activeTabId, state.dataModel],
  );

  // DB Query Selectors
  const selectDBQuery = useMemo(
    () =>
      state.tabs.activeTabId
        ? state.dbQuery[state.tabs.activeTabId]?.dbQuery
        : undefined,
    [state.tabs.activeTabId, state.dbQuery],
  );

  // History Selectors
  const selectDBQueryLogs = useMemo(
    () => state.dbHistory.dbQueryLogs,
    [state.dbHistory.dbQueryLogs],
  );

  const selectDBQueryLogsNext = useMemo(
    () => state.dbHistory.dbQueryLogsNext,
    [state.dbHistory.dbQueryLogsNext],
  );

  // Config Selectors
  const selectIsShowingSidebar = useMemo(
    () => state.config.isShowingSidebar ?? true,
    [state.config.isShowingSidebar],
  );

  // Console Selectors
  const selectBlocks = useMemo(
    () => state.console.blocks,
    [state.console.blocks],
  );

  // API Selectors
  const selectAPIVersion = useMemo(
    () => state.api.version,
    [state.api.version],
  );

  return {
    // Current User
    selectCurrentUser,
    getCurrentUser,
    selectIsAuthenticated,

    // Projects
    selectProjects,
    selectCurrentProject,
    selectDBConnectionsInProject,
    selectProjectMemberPermissions,

    // DB Connection
    selectDBConnection,
    selectIsDBConnected,
    selectDBDataModels,
    selectDBQueries,
    selectIsFetchingDBDataModels,

    // Tabs
    selectTabs,
    selectActiveTab,

    // Data Model
    selectQueryData,
    selectIsFetchingQueryData,
    selectSingleDataModel,
    selectIsFetchingDataModel,

    // DB Query
    selectDBQuery,

    // History
    selectDBQueryLogs,
    selectDBQueryLogsNext,

    // Config
    selectIsShowingSidebar,

    // Console
    selectBlocks,

    // API
    selectAPIVersion,
  };
}
