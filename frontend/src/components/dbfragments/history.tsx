import dateformat from "dateformat";
import { useContext, useEffect } from "react";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import type { DBConnection, Tab } from "../../data/models";
import { useApp } from "../../hooks/useApp";
import TabContext from "../layouts/tabcontext";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";

type DBHistoryPropType = {};

const DBHistoryFragment = ({}: DBHistoryPropType) => {
  const {
    selectDBConnection,
    selectDBQueryLogs,
    selectDBQueryLogsNext,
    getDBQueryLogs,
    resetDBQueryLogs,
  } = useApp();

  const currentTab: Tab = useContext(TabContext)!;

  const dbConnection: DBConnection | undefined = selectDBConnection;
  const dbQueryLogs = selectDBQueryLogs;
  const dbQueryLogsNext = selectDBQueryLogsNext;

  useEffect(() => {
    if (dbConnection) {
      (async () => {
        resetDBQueryLogs();
      })();
      fetchDBQueryLogs();
    }
  }, [dbConnection]);

  const fetchDBQueryLogs = async () => {
    const result = await getDBQueryLogs(dbConnection!.id);
    if (!result.success) {
      toast.error(result.error!);
    }
  };

  function refreshHandler() {
    resetDBQueryLogs();
    fetchDBQueryLogs();
  }

  return (
    <div className={currentTab.isActive ? "db-tab-active" : "db-tab"}>
      {dbConnection && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Showing History in {dbConnection.name}
            </h1>
            <Button onClick={refreshHandler} variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <InfiniteScroll
            dataLength={dbQueryLogs.length}
            next={fetchDBQueryLogs}
            hasMore={dbQueryLogsNext !== -1}
            loader={
              <p className="py-4 text-center text-gray-500">Loading...</p>
            }
            endMessage={
              <p className="py-4 text-center text-gray-600">
                <b>You have seen it all!</b>
              </p>
            }
            scrollableTarget="maincontent"
          >
            <div className="overflow-x-auto">
              <table className="w-full rounded-lg border border-gray-200 bg-white">
                <tbody>
                  {dbQueryLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                          {log.query}
                        </code>
                      </td>
                      <td className="w-32 p-4 text-sm whitespace-nowrap text-gray-500">
                        {dateformat(log.createdAt, "mmm dd, yyyy HH:MM:ss")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </>
      )}
    </div>
  );
};

export default DBHistoryFragment;
