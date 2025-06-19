import { Database, File, Plus, Sparkles, Terminal, Wrench } from "lucide-react";
import React, { useState } from "react";
import { DBConnType, TabType } from "../../../data/defaults";
import type { DBConnection, DBDataModel, DBQuery } from "../../../data/models";
import { useApp } from "../../../hooks/useApp";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";

enum DBSidebarTabType {
  DATABASE = "DATABASE",
  QUERIES = "QUERIES",
  TOOLBOX = "TOOLBOX",
}

type DatabaseSidebarPropType = {};

const DatabaseSidebar = (_: DatabaseSidebarPropType) => {
  const { createTab, selectDBConnection, selectDBDataModels, selectDBQueries } =
    useApp();

  const [currentSidebarTab, setCurrentSidebarTab] = useState<DBSidebarTabType>(
    DBSidebarTabType.DATABASE,
  );

  const dbConnection: DBConnection | undefined = selectDBConnection;
  const dbDataModels: DBDataModel[] = selectDBDataModels;
  const dbQueries: DBQuery[] = selectDBQueries;

  const openDataTab = (schema: string, name: string) => {
    createTab(dbConnection!.id, TabType.DATA, { schema, name });
  };

  const openQueryTab = (queryId: string) => {
    createTab(dbConnection!.id, TabType.QUERY, { queryId });
  };

  const openConsoleTab = () => {
    createTab(dbConnection!.id, TabType.CONSOLE, {});
  };

  const openGenerateSQLTab = () => {
    createTab(dbConnection!.id, TabType.GENSQL, {});
  };

  const switchSidebarTab = (tabType: DBSidebarTabType) => {
    setCurrentSidebarTab(tabType);
  };

  const TabButton = ({
    type,
    icon: Icon,
    isActive,
  }: {
    type: DBSidebarTabType;
    icon: any;
    isActive: boolean;
  }) => (
    <button
      className={`rounded-md p-2 transition-colors ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50"
      }`}
      onClick={() => switchSidebarTab(type)}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <React.Fragment>
      <div className="mb-4 flex justify-center gap-1 border-b p-2">
        <TabButton
          type={DBSidebarTabType.DATABASE}
          icon={Database}
          isActive={currentSidebarTab === DBSidebarTabType.DATABASE}
        />
        <TabButton
          type={DBSidebarTabType.QUERIES}
          icon={File}
          isActive={currentSidebarTab === DBSidebarTabType.QUERIES}
        />
        <TabButton
          type={DBSidebarTabType.TOOLBOX}
          icon={Wrench}
          isActive={currentSidebarTab === DBSidebarTabType.TOOLBOX}
        />
      </div>

      {currentSidebarTab === DBSidebarTabType.DATABASE && (
        <SidebarGroup>
          <SidebarGroupLabel>Data Models</SidebarGroupLabel>
          <SidebarMenu>
            {dbDataModels.map((dataModel: DBDataModel) => {
              const label =
                dbConnection!.type === DBConnType.POSTGRES
                  ? `${dataModel.schemaName}.${dataModel.name}`
                  : `${dataModel.name}`;
              return (
                <SidebarMenuItem key={dataModel.schemaName + dataModel.name}>
                  <SidebarMenuButton
                    onClick={() =>
                      openDataTab(dataModel.schemaName ?? "", dataModel.name)
                    }
                  >
                    <Database className="h-4 w-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {currentSidebarTab === DBSidebarTabType.QUERIES && (
        <SidebarGroup>
          <SidebarGroupLabel>Queries</SidebarGroupLabel>
          <SidebarMenu>
            {dbQueries.map((dbQuery: DBQuery) => {
              return (
                <SidebarMenuItem key={dbQuery.id}>
                  <SidebarMenuButton onClick={() => openQueryTab(dbQuery.id)}>
                    <File className="h-4 w-4" />
                    <span>{dbQuery.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => openQueryTab("new")}>
                <Plus className="h-4 w-4" />
                <span>New Query</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      {currentSidebarTab === DBSidebarTabType.TOOLBOX && (
        <SidebarGroup>
          <SidebarGroupLabel>Toolbox</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => openConsoleTab()}>
                <Terminal className="h-4 w-4" />
                <span>Console</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => openGenerateSQLTab()}>
                <Sparkles className="h-4 w-4" />
                <span>Generate SQL</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </React.Fragment>
  );
};

export default DatabaseSidebar;
