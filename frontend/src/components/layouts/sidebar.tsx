import { useLocation } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
} from "../ui/sidebar";
import UnifiedSidebar from "./sidebars/unifiedsidebar";
import SettingSidebar from "./sidebars/settingsidebar";

const AppSidebar = () => {
  const location = useLocation();

  const isSettingsPage = location.pathname.startsWith("/settings");

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {/* <h2 className="text-lg font-semibold">Slashbase</h2> */}
      </SidebarHeader>
      <SidebarContent className="px-4">
        {isSettingsPage ? <SettingSidebar /> : <UnifiedSidebar />}
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default AppSidebar;
