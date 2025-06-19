import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
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
import { selectAllDBConnections } from "../../redux/allDBConnectionsSlice";
import {
  selectIsShowingSidebar,
  setIsShowingSidebar,
} from "../../redux/configSlice";
import {
  getDBDataModels,
  resetDBDataModels,
  selectDBConnection,
} from "../../redux/dbConnectionSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectProjects } from "../../redux/projectsSlice";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const dispatch = useAppDispatch();

  const projects: Project[] = useAppSelector(selectProjects);
  const dbConnections: DBConnection[] = useAppSelector(selectAllDBConnections);
  const currentDBConnection: DBConnection | undefined =
    useAppSelector(selectDBConnection);
  const isShowingSidebar: boolean = useAppSelector(selectIsShowingSidebar);

  const [isShowingDropDown, setIsShowingDropDown] = useState(false);
  const [isShowingNavDropDown, setIsShowingNavDropDown] = useState(false);
  const [isShowingDBDropDown, setIsShowingDBDropdown] = useState(false);

  const onNavigate = (option: {
    value: string;
    label: string;
    path: string;
  }) => {
    navigate(option.path);
    setIsShowingNavDropDown(false);
  };

  const toggleSidebar = () => {
    dispatch(setIsShowingSidebar(!isShowingSidebar));
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
    dispatch(resetDBDataModels());
    dispatch(getDBDataModels({ dbConnId: currentDBConnection!.id }));
  };

  return (
    <TooltipProvider>
      <header className="fixed top-0 flex flex-row h-fit w-full h-15 items-center justify-between bg-gray-800 px-4 text-white z-11">
        {/* Left Side - Navigation */}
        <div className="flex flex-row items-center space-x-1 ml-16">
          {/* Home Button */}
          <Link to={Constants.APP_PATHS.HOME.path}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 bg-gray-700 text-white transition-colors hover:bg-black ${
                currentProjectOption !== undefined
                  ? 'relative rounded-l-lg rounded-r-none after:absolute after:top-0 after:left-full after:border-t-[20px] after:border-b-[20px] after:border-l-[8px] after:border-t-transparent after:border-b-transparent after:border-l-gray-700 after:content-[""] hover:after:border-l-black'
                  : "rounded-lg"
              } `}
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          {/* Breadcrumb Navigation */}
          <div className="flex h-10 items-center">
            {/* Project Dropdown */}
            {currentProjectOption !== undefined && (
              <div className="relative">
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setIsShowingNavDropDown(false);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 bg-gray-700 pl-5 text-white transition-colors hover:bg-black ${
                      currentDBOption === undefined
                        ? 'relative rounded-r-lg before:absolute before:top-0 before:left-0 before:border-t-[20px] before:border-b-[20px] before:border-l-[8px] before:border-t-transparent before:border-b-transparent before:border-l-gray-800 before:content-[""]'
                        : 'relative rounded-none before:absolute before:top-0 before:left-0 before:border-t-[20px] before:border-b-[20px] before:border-l-[8px] before:border-t-transparent before:border-b-transparent before:border-l-gray-800 before:content-[""] after:absolute after:top-0 after:left-full after:border-t-[20px] after:border-b-[20px] after:border-l-[8px] after:border-t-transparent after:border-b-transparent after:border-l-gray-700 after:content-[""] hover:after:border-l-black'
                    } `}
                    onClick={() => {
                      setIsShowingNavDropDown(!isShowingNavDropDown);
                    }}
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

                  {isShowingNavDropDown && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="py-1">
                        {projectOptions.map((x) => (
                          <div key={x.value}>
                            <button
                              onClick={() => {
                                onNavigate(x);
                              }}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                x.value === currentProjectOption
                                  ? "bg-blue-50 font-medium text-blue-700"
                                  : "text-gray-700 hover:bg-gray-100"
                              } `}
                            >
                              {x.label}
                            </button>
                            {x.value === "home" && (
                              <hr className="my-1 border-gray-200" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </OutsideClickHandler>
              </div>
            )}

            {/* Database Dropdown */}
            {currentProjectOption !== undefined &&
              currentDBOption !== undefined && (
                <div className="relative flex items-center">
                  <OutsideClickHandler
                    onOutsideClick={() => {
                      setIsShowingDBDropdown(false);
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-10 rounded-r-lg bg-gray-700 pl-5 text-white transition-colors before:absolute before:top-0 before:left-0 before:border-t-[20px] before:border-b-[20px] before:border-l-[8px] before:border-t-transparent before:border-b-transparent before:border-l-gray-800 before:content-[''] hover:bg-black"
                      onClick={() => {
                        setIsShowingDBDropdown(!isShowingDBDropDown);
                      }}
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

                    {isShowingDBDropDown && (
                      <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                        <div className="py-1">
                          {dbOptions.map((x) => (
                            <div key={x.value}>
                              <button
                                onClick={() => {
                                  onNavigate(x);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                  x.value === currentDBOption
                                    ? "bg-blue-50 font-medium text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                } `}
                              >
                                {x.label}
                              </button>
                              {x.value === "home" && (
                                <hr className="my-1 border-gray-200" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </OutsideClickHandler>

                  {/* Refresh Button */}
                  {currentDBOption !== undefined && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-8 w-8 bg-gray-700 p-0 text-white transition-colors hover:bg-black"
                          onClick={refreshDataModels}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh data models</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right Side - Settings Menu */}
        <div className="relative">
          <OutsideClickHandler
            onOutsideClick={() => {
              setIsShowingDropDown(false);
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-10 bg-gray-700 text-white transition-colors hover:bg-black"
              onClick={() => {
                setIsShowingDropDown(!isShowingDropDown);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {isShowingDropDown && (
              <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      openInBrowser(Constants.EXTERNAL_PATHS.CHANGELOG);
                    }}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    What's New?
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <Link
                    to={Constants.APP_PATHS.SETTINGS_GENERAL.path}
                    className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    to={Constants.APP_PATHS.SETTINGS_SUPPORT.path}
                    className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Support
                  </Link>
                  {Constants.Build === "server" && (
                    <>
                      <hr className="my-1 border-gray-200" />
                      <Link
                        to={Constants.APP_PATHS.LOGOUT.path}
                        className="block px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        Logout
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </OutsideClickHandler>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
