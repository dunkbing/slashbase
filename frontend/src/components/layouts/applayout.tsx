import { type FunctionComponent } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import Footer from "./footer";
import Header from "./header";
import AppSidebar from "./sidebar";
import TabsBar from "./tabsbar";

const AppLayout: FunctionComponent = () => {
  const location = useLocation();
  const { selectIsShowingSidebar, setIsShowingSidebar } = useApp();

  const isShowingSidebar: boolean = selectIsShowingSidebar;

  const showTabsBar = location.pathname.startsWith("/db") ? true : false;

  const handleSidebarOpenChange = (open: boolean) => {
    setIsShowingSidebar(open);
  };

  return (
    <SidebarProvider
      open={isShowingSidebar}
      onOpenChange={handleSidebarOpenChange}
    >
      <AppSidebar />
      <Header />
      <SidebarInset className="flex flex-1 flex-col">
        <div className="flex flex-1">
          <main className="mt-10 flex flex-1 flex-col">
            {showTabsBar && <TabsBar />}
            <div id="maincontent" className="flex-1 p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarInset>
      <Footer />
    </SidebarProvider>
  );
};

export default AppLayout;
