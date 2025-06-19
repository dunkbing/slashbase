import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Table as TableIcon, BarChart3 } from "lucide-react";
import { DBConnType, TabType } from "../../data/defaults";
import type {
  DBConnection,
  DBQueryData,
  DBQueryResult,
  Tab,
} from "../../data/models";
import { useApp } from "../../hooks/useApp";
import TabContext from "../layouts/tabcontext";
import Chart from "./chart/chart";
import JsonTable from "./jsontable/jsontable";
import QueryEditor from "./queryeditor/queryeditor";
import Table from "./table/table";

const DBQueryFragment = () => {
  const {
    selectDBConnection,
    selectDBQuery,
    getDBQuery,
    runQuery,
    setDBQuery,
    closeTab,
    updateActiveTab,
  } = useApp();

  const dbConnection: DBConnection | undefined = selectDBConnection;
  const dbQuery = selectDBQuery;

  const currentTab: Tab = useContext(TabContext)!;

  const [queryData, setQueryData] = useState<DBQueryData>();
  const [queryResult, setQueryResult] = useState<DBQueryResult>();
  const [isChartEnabled, setIsChartEnabled] = useState<boolean>(false);

  const queryId = currentTab.metadata.queryId;
  const tabQuery = currentTab.metadata.query;

  useEffect(() => {
    (async () => {
      if (queryId && queryId !== "new") {
        getDBQuery(String(queryId), currentTab.id);
      }
      if (queryId === "new") {
        setDBQuery(currentTab.id, undefined);
      }
    })();
  }, [queryId]);

  useEffect(() => {
    setQueryData(undefined);
    setQueryResult(undefined);
    setIsChartEnabled(false);
  }, [queryId]);

  const onRunQueryBtn = async (query: string, callback: () => void) => {
    const result = await runQuery(dbConnection!.id, query);
    if (result.success) {
      toast.success("Success");
      if ((result.data as DBQueryResult).message) {
        setQueryResult(result.data as DBQueryResult);
        setQueryData(undefined);
      } else {
        setQueryData(result.data as DBQueryData);
        setQueryResult(undefined);
      }
    } else {
      toast.error(result.error!);
    }
    callback();
  };

  const toggleIsChartEnabled = () => {
    setIsChartEnabled(!isChartEnabled);
  };

  const onQuerySaved = (queryId: string, query: string) => {
    updateActiveTab(TabType.QUERY, { queryId: queryId, query: query });
  };

  const onDelete = () => {
    closeTab(dbConnection!.id, currentTab.id);
  };

  return (
    <div className={currentTab.isActive ? "db-tab-active" : "db-tab"}>
      {dbConnection &&
        ((queryId === "new" && !dbQuery) ||
          (dbQuery && dbQuery.id === queryId)) && (
          <QueryEditor
            initialValue={queryId === "new" ? tabQuery : (dbQuery?.query ?? "")}
            initQueryName={dbQuery?.name ?? ""}
            queryId={queryId === "new" ? "" : String(queryId)}
            dbType={dbConnection!.type}
            runQuery={onRunQueryBtn}
            onSave={onQuerySaved}
            onDelete={onDelete}
          />
        )}

      {queryData && (
        <div className="mt-6 mb-4">
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setIsChartEnabled(false)}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  !isChartEnabled
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <TableIcon className="mr-2 h-4 w-4" />
                Data
              </button>
              <button
                onClick={() => setIsChartEnabled(true)}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isChartEnabled
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {queryData ? (
        isChartEnabled ? (
          <Chart dbConn={dbConnection!} queryData={queryData} />
        ) : (
          <>
            {(dbConnection!.type === DBConnType.POSTGRES ||
              dbConnection!.type === DBConnType.MYSQL) && (
              <Table
                dbConnection={dbConnection!}
                queryData={queryData}
                mSchema={""}
                mName={""}
                isReadOnly={true}
                onFilterChanged={() => {}}
                onSortChanged={() => {}}
                onRefresh={() => {}}
                isInteractive={false}
              />
            )}
            {dbConnection!.type === DBConnType.MONGO && (
              <JsonTable
                dbConnection={dbConnection!}
                queryData={queryData}
                mName={""}
                isReadOnly={true}
                onFilterChanged={() => {}}
                onSortChanged={() => {}}
                onRefresh={() => {}}
                isInteractive={false}
              />
            )}
          </>
        )
      ) : null}

      {queryResult && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <span className="text-green-800">
            <strong>Result of Query: </strong>
            {queryResult.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default DBQueryFragment;
