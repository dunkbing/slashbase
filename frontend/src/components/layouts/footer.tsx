import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Circle, HelpCircle } from "lucide-react";
import Constants from "../../constants";
import { useApp } from "../../hooks/useApp";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkConnection, selectDBConnection, selectIsDBConnected } = useApp();

  const showStatus = location.pathname.startsWith("/db");

  const dbConnection = selectDBConnection;
  const isDBConnected = selectIsDBConnected;

  useEffect(() => {
    if (showStatus && dbConnection) {
      checkConnection();
    }
  }, [showStatus, dbConnection, checkConnection]);

  const openSupport = () => {
    navigate(Constants.APP_PATHS.SETTINGS_SUPPORT.path);
  };

  return (
    <footer className="fixed bottom-0 z-11 flex h-fit w-full flex-row items-center justify-between border-t border-gray-200 bg-gray-50 px-0 text-xs text-gray-600">
      <SidebarTrigger />
      {showStatus && isDBConnected !== undefined && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 border-none bg-transparent px-2 py-0 text-xs text-gray-600 hover:text-black"
        >
          {!isDBConnected ? (
            <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
          ) : (
            <Circle className="mr-1 h-3 w-3 fill-current text-green-500" />
          )}
          <span>
            {isDBConnected !== undefined && isDBConnected
              ? "connected"
              : "not connected"}
          </span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={openSupport}
        className="h-5 border-none bg-transparent px-2 py-0 text-xs text-gray-600 hover:text-black"
      >
        <HelpCircle className="mr-1 h-3 w-3" />
        <span>Help & Feedback</span>
      </Button>
    </footer>
  );
};

export default Footer;
