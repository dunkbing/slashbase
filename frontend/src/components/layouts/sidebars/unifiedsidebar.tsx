import {
  ChevronDown,
  ChevronRight,
  Database,
  File,
  Folder,
  FolderPlus,
  Plus,
  Sparkles,
  Terminal,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Constants from "../../../constants";
import { DBConnType, TabType } from "../../../data/defaults";
import type {
  DBConnection,
  DBDataModel,
  DBQuery,
  Project,
} from "../../../data/models";
import { useAllDBConnections } from "../../../contexts/db-connection-context";
import { useApp } from "../../../hooks/useApp";
import CreateNewProjectModal from "../../home/createprojectmodal";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../ui/sidebar";

type UnifiedSidebarPropType = {};

const UnifiedSidebar = (_: UnifiedSidebarPropType) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isShowingCreateProject, setIsShowingCreateProject] = useState(false);
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(
    new Set(),
  );
  const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<string>>(
    new Set(),
  );

  const {
    selectProjects,
    selectDBConnection,
    selectDBDataModels,
    selectDBQueries,
    createTab,
  } = useApp();

  const allProjects: Project[] = selectProjects;
  const allDBConnections: DBConnection[] = useAllDBConnections();
  console.log({ allDBConnections });

  const currentDBConnection: DBConnection | undefined = selectDBConnection;
  const dbDataModels: DBDataModel[] = selectDBDataModels;
  const dbQueries: DBQuery[] = selectDBQueries;

  // Check if we're on a database page
  const isOnDBPage = location.pathname.startsWith("/db");
  const currentDBId = isOnDBPage ? location.pathname.split("/")[2] : null;

  // Auto-expand current database only if not manually collapsed
  useEffect(() => {
    if (
      currentDBId &&
      !expandedDatabases.has(currentDBId) &&
      !manuallyCollapsed.has(currentDBId)
    ) {
      setExpandedDatabases((prev) => new Set([...prev, currentDBId]));
    }
  }, [currentDBId, expandedDatabases, manuallyCollapsed]);

  const handleDatabaseToggle = async (
    dbConn: DBConnection,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const isExpanded = expandedDatabases.has(dbConn.id);

    if (!isExpanded) {
      // Expand: remove from manually collapsed and add to expanded
      setManuallyCollapsed((prev) => {
        const newSet = new Set(prev);
        newSet.delete(dbConn.id);
        return newSet;
      });
      setExpandedDatabases((prev) => new Set([...prev, dbConn.id]));
      navigate(Constants.APP_PATHS.DB.path.replace("[id]", dbConn.id));
    } else {
      // Collapse: add to manually collapsed and remove from expanded
      setManuallyCollapsed((prev) => new Set([...prev, dbConn.id]));
      setExpandedDatabases((prev) => {
        const newSet = new Set(prev);
        newSet.delete(dbConn.id);
        return newSet;
      });
    }
  };

  const openDataTab = (schema: string, name: string) => {
    if (currentDBConnection) {
      createTab(currentDBConnection.id, TabType.DATA, { schema, name });
    }
  };

  const openQueryTab = (queryId: string) => {
    if (currentDBConnection) {
      createTab(currentDBConnection.id, TabType.QUERY, { queryId });
    }
  };

  const openConsoleTab = () => {
    if (currentDBConnection) {
      createTab(currentDBConnection.id, TabType.CONSOLE, {});
    }
  };

  const openGenerateSQLTab = () => {
    if (currentDBConnection) {
      createTab(currentDBConnection.id, TabType.GENSQL, {});
    }
  };

  return (
    <React.Fragment>
      {/* Projects & Databases Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Projects & Databases</SidebarGroupLabel>
        <SidebarMenu>
          {allProjects.map((project: Project) => {
            const projectConnections = allDBConnections.filter(
              (dbConn: DBConnection) => dbConn.projectId === project.id,
            );

            return (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link
                    to={Constants.APP_PATHS.PROJECT.path.replace(
                      "[id]",
                      project.id,
                    )}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{project.name}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {projectConnections.map((dbConn: DBConnection) => {
                    const isExpanded = expandedDatabases.has(dbConn.id);
                    const isCurrentDB = currentDBId === dbConn.id;

                    return (
                      <React.Fragment key={dbConn.id}>
                        <SidebarMenuSubItem>
                          <div className="flex w-full items-center">
                            <SidebarMenuSubButton asChild className="flex-1">
                              <Link
                                to={Constants.APP_PATHS.DB.path.replace(
                                  "[id]",
                                  dbConn.id,
                                )}
                              >
                                <Database className="h-4 w-4" />
                                <span>{dbConn.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                            <button
                              onClick={(e) => handleDatabaseToggle(dbConn, e)}
                              className="hover:bg-sidebar-accent ml-1 rounded p-1"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </SidebarMenuSubItem>

                        {/* Database Tables/Models - Only show if expanded and connected */}
                        {isExpanded && isCurrentDB && (
                          <SidebarMenuSub className="ml-4">
                            {/* Data Models */}
                            {dbDataModels.length > 0 && (
                              <SidebarMenuSubItem>
                                <div className="text-sidebar-foreground/70 px-2 py-1 text-xs font-medium">
                                  Tables
                                </div>
                              </SidebarMenuSubItem>
                            )}
                            {dbDataModels.map((dataModel: DBDataModel) => {
                              const label =
                                currentDBConnection?.type ===
                                DBConnType.POSTGRES
                                  ? `${dataModel.schemaName}.${dataModel.name}`
                                  : `${dataModel.name}`;
                              return (
                                <SidebarMenuSubItem
                                  key={dataModel.schemaName + dataModel.name}
                                >
                                  <SidebarMenuSubButton
                                    onClick={() =>
                                      openDataTab(
                                        dataModel.schemaName ?? "",
                                        dataModel.name,
                                      )
                                    }
                                    className="ml-2"
                                  >
                                    <Database className="h-3 w-3" />
                                    <span className="text-xs">{label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}

                            {/* Queries */}
                            {dbQueries.length > 0 && (
                              <SidebarMenuSubItem>
                                <div className="text-sidebar-foreground/70 px-2 py-1 text-xs font-medium">
                                  Queries
                                </div>
                              </SidebarMenuSubItem>
                            )}
                            {dbQueries.map((dbQuery: DBQuery) => (
                              <SidebarMenuSubItem key={dbQuery.id}>
                                <SidebarMenuSubButton
                                  onClick={() => openQueryTab(dbQuery.id)}
                                  className="ml-2"
                                >
                                  <File className="h-3 w-3" />
                                  <span className="text-xs">
                                    {dbQuery.name}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => openQueryTab("new")}
                                className="ml-2"
                              >
                                <Plus className="h-3 w-3" />
                                <span className="text-xs">New Query</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>

                            {/* Toolbox */}
                            <SidebarMenuSubItem>
                              <div className="text-sidebar-foreground/70 px-2 py-1 text-xs font-medium">
                                Tools
                              </div>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => openConsoleTab()}
                                className="ml-2"
                              >
                                <Terminal className="h-3 w-3" />
                                <span className="text-xs">Console</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => openGenerateSQLTab()}
                                className="ml-2"
                              >
                                <Sparkles className="h-3 w-3" />
                                <span className="text-xs">Generate SQL</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        to={Constants.APP_PATHS.NEW_DB.path.replace(
                          "[id]",
                          project.id,
                        )}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add DB</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setIsShowingCreateProject(true);
              }}
            >
              <FolderPlus className="h-4 w-4" />
              <span>Create new project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {isShowingCreateProject && (
        <CreateNewProjectModal
          onClose={() => {
            setIsShowingCreateProject(false);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default UnifiedSidebar;
