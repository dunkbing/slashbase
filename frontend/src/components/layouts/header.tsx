import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Home,
  Folder,
  Database,
  ChevronDown,
  RefreshCw,
  Settings,
  ExternalLink,
} from "lucide-react";
import Constants from "../../constants";
import type { DBConnection, Project } from "../../data/models";
import { openInBrowser } from "../../lib/utils";
import { useAllDBConnections } from "../../contexts/db-connection-context";
import { useApp } from "../../hooks/useApp";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const {
    getDBDataModels,
    resetDBDataModels,
    selectProjects,
    selectDBConnection,
  } = useApp();

  const projects: Project[] = selectProjects;
  const dbConnections: DBConnection[] = useAllDBConnections();
  const currentDBConnection: DBConnection | undefined = selectDBConnection;

  const onNavigate = (path: string) => {
    navigate(path);
  };

  let currentProjectOption: string | undefined = undefined;
  let currentDBOption: string | undefined = undefined;
  if (location.pathname.startsWith("/project"))
    currentProjectOption = String(params.id);
  else if (location.pathname.startsWith("/db")) {
    if (currentDBConnection)
      currentProjectOption = currentDBConnection?.projectId;
    currentDBOption = currentDBConnection?.id;
  }

  const projectOptions = [
    ...projects.map((x: Project) => ({
      value: x.id,
      label: x.name,
      path: Constants.APP_PATHS.PROJECT.path.replace("[id]", x.id),
    })),
  ];
  const dbOptions = [
    ...dbConnections
      .filter((x: DBConnection) => x.projectId === currentProjectOption)
      .map((x: DBConnection) => ({
        value: x.id,
        label: x.name,
        path: Constants.APP_PATHS.DB.path.replace("[id]", x.id),
      })),
  ];

  const refreshDataModels = () => {
    resetDBDataModels();
    getDBDataModels(currentDBConnection!.id);
  };

  return (
    <TooltipProvider>
      <header className="fixed top-0 z-50 flex h-fit w-full flex-row items-center justify-between border-b border-gray-700 bg-gray-800 text-white">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row">
            <Link to={Constants.APP_PATHS.HOME.path} className="ml-20">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 bg-gray-700 px-3 text-white transition-colors hover:bg-gray-600"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            {currentProjectOption !== undefined && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 bg-gray-700 px-3 text-white transition-colors hover:bg-gray-600"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span className="mr-2">
                      {
                        projectOptions.find(
                          (x) => x.value === currentProjectOption,
                        )?.label
                      }
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {projectOptions.map((x) => (
                    <DropdownMenuItem
                      key={x.value}
                      onClick={() => onNavigate(x.path)}
                      className={
                        x.value === currentProjectOption
                          ? "bg-blue-50 font-medium text-blue-700"
                          : ""
                      }
                    >
                      {x.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Database Dropdown */}
          {currentProjectOption !== undefined &&
            currentDBOption !== undefined && (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 bg-gray-700 px-3 text-white transition-colors hover:bg-gray-600"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      <span className="mr-2">
                        {
                          dbOptions.find((x) => x.value === currentDBOption)
                            ?.label
                        }
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {dbOptions.map((x) => (
                      <DropdownMenuItem
                        key={x.value}
                        onClick={() => onNavigate(x.path)}
                        className={
                          x.value === currentDBOption
                            ? "bg-blue-50 font-medium text-blue-700"
                            : ""
                        }
                      >
                        {x.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Refresh Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 bg-gray-700 p-0 text-white transition-colors hover:bg-gray-600"
                      onClick={refreshDataModels}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh data models</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

          {/* Right Side - Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  openInBrowser(Constants.EXTERNAL_PATHS.CHANGELOG);
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                What's New?
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={Constants.APP_PATHS.SETTINGS_GENERAL.path}>
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={Constants.APP_PATHS.SETTINGS_SUPPORT.path}>
                  Support
                </Link>
              </DropdownMenuItem>
              {Constants.Build === "server" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to={Constants.APP_PATHS.LOGOUT.path}
                      className="text-red-600 focus:text-red-600"
                    >
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
