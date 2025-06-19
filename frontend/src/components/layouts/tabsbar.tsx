import { X, Plus } from "lucide-react";
import { TabType } from "../../data/defaults";
import type { Tab } from "../../data/models";
import { useApp } from "../../hooks/useApp";
import { Button } from "../ui/button";

type TabsBarPropType = {};

const TabsBar = (_: TabsBarPropType) => {
  const { createTab, setActiveTab, closeTab, selectDBConnection, selectTabs } =
    useApp();

  const dbConnection = selectDBConnection;
  const tabs: Tab[] = selectTabs;

  const createNewTab = async () => {
    await createTab(dbConnection!.id, TabType.BLANK);
  };

  const switchToTab = async (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCloseTab = async (
    e: React.MouseEvent<HTMLElement>,
    tabId: string,
  ) => {
    e.stopPropagation();
    await closeTab(dbConnection!.id, tabId);
  };

  const getTabLabel = (tab: Tab) => {
    switch (tab.type) {
      case TabType.BLANK:
        return "New Tab";
      case TabType.HISTORY:
        return "History";
      case TabType.CONSOLE:
        return "Console";
      case TabType.GENSQL:
        return "Generate SQL";
      case TabType.DATA:
      case TabType.MODEL:
        return tab.metadata.schema === ""
          ? tab.metadata.name
          : `${tab.metadata.schema}.${tab.metadata.name}`;
      case TabType.QUERY:
        return tab.metadata.queryName ? tab.metadata.queryName : "New Query";
      default:
        return "Tab";
    }
  };

  if (!dbConnection) {
    return <></>;
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center px-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`mr-1 flex h-10 cursor-pointer items-center rounded-t-md px-3 transition-colors ${
              tab.isActive
                ? "-mb-px border-t border-r border-l border-gray-200 bg-white text-gray-900"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } `}
            onClick={() => switchToTab(tab.id)}
          >
            <span className="max-w-32 truncate text-sm font-medium">
              {getTabLabel(tab)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`ml-2 h-5 w-5 rounded-sm p-0 transition-colors hover:bg-gray-200 ${tab.isActive ? "opacity-70 hover:opacity-100" : "opacity-50 hover:opacity-100"} `}
              onClick={(e) => handleCloseTab(e, tab.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={createNewTab}
          className="ml-2 h-8 w-8 rounded-md p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TabsBar;
