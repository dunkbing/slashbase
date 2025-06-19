import { useLocation } from "react-router-dom";
import type { DBConnection } from "../../data/models";
import { useApp } from "../../hooks/useApp";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
} from "../ui/sidebar";
import DatabaseSidebar from "./sidebars/dbsidebar";
import HomeSidebar from "./sidebars/homesidebar";
import SettingSidebar from "./sidebars/settingsidebar";

enum SidebarViewType {
  HOME = "HOME", // home sidebar
  DATABASE = "DATABASE", // Used to show elements of database screen
  SETTINGS = "SETTINGS", // Used to show elements of settings screen
}

const AppSidebar = () => {
  const location = useLocation();
  const { selectDBConnection } = useApp();

  const sidebarView: SidebarViewType = location.pathname.startsWith("/db")
    ? SidebarViewType.DATABASE
    : location.pathname.startsWith("/settings")
      ? SidebarViewType.SETTINGS
      : SidebarViewType.HOME;

  const dbConnection: DBConnection | undefined = selectDBConnection;

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {/* <h2 className="text-lg font-semibold">Slashbase</h2> */}
      </SidebarHeader>
      <SidebarContent className="px-4">
        {sidebarView === SidebarViewType.HOME && <HomeSidebar />}
        {sidebarView === SidebarViewType.DATABASE && dbConnection && (
          <DatabaseSidebar />
        )}
        {sidebarView === SidebarViewType.SETTINGS && <SettingSidebar />}
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default AppSidebar;
