import React, { useContext, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { DBConnType } from "../../data/defaults";
import type {
  DBConnection,
  DBDataModel,
  Project,
  Tab,
} from "../../data/models";
import { useApp } from "../../hooks/useApp";

type ProjectPermissions = {
  readOnly: boolean;
};
import TabContext from "../layouts/tabcontext";
import { Button } from "../ui/button";
import JsonTable from "./jsontable/jsontable";
import Table from "./table/table";

const DBShowDataFragment = () => {
  const {
    selectDBConnection,
    selectDBDataModels,
    selectIsShowingSidebar,
    selectCurrentProject,
    selectProjectMemberPermissions,
    selectIsFetchingQueryData,
    selectQueryData,
    getDBDataInDataModel,
  } = useApp();

  const dbConnection: DBConnection | undefined = selectDBConnection;
  const dbDataModels: DBDataModel[] = selectDBDataModels;
  const isShowingSidebar: boolean = selectIsShowingSidebar;
  const project: Project | undefined = selectCurrentProject;
  const projectMemberPermissions: ProjectPermissions =
    selectProjectMemberPermissions;
  const currentTab: Tab = useContext(TabContext)!;

  const [dataModel, setDataModel] = useState<DBDataModel>();
  const dataLoading = selectIsFetchingQueryData;
  const queryData = selectQueryData;
  const [queryOffset, setQueryOffset] = useState(0);
  const [queryCount, setQueryCount] = useState<number | undefined>(undefined);
  const [queryLimit] = useState(
    dbConnection
      ? dbConnection.type === DBConnType.POSTGRES ||
        dbConnection.type === DBConnType.MYSQL
        ? 200
        : 50
      : 100,
  );
  const [queryFilter, setQueryFilter] = useState<string[] | undefined>(
    undefined,
  );
  const [querySort, setQuerySort] = useState<string[] | undefined>(undefined);

  const mschema = currentTab.metadata.schema;
  const mname = currentTab.metadata.name;

  useEffect(() => {
    const dModel = dbDataModels.find(
      (x) => x.schemaName === mschema && x.name === mname,
    );
    if (dModel) {
      setDataModel(dModel);
    }
  }, [dbDataModels]);

  useEffect(() => {
    if (dataModel && !queryCount) {
      fetchData(true);
    }
  }, [dataModel, queryCount]);

  useEffect(() => {
    fetchData(false);
  }, [queryOffset, querySort]);

  useEffect(() => {
    fetchData(true);
  }, [queryFilter]);

  const fetchData = async (isFirstFetch: boolean) => {
    if (!dataModel) return;
    try {
      const result = await getDBDataInDataModel({
        tabId: currentTab.id,
        dbConnectionId: dbConnection!.id,
        schemaName: dataModel!.schemaName ?? "",
        name: dataModel!.name,
        queryLimit,
        queryOffset,
        isFirstFetch,
        queryFilter,
        querySort,
      });
      if (isFirstFetch && result?.data) {
        setQueryCount(result.data.count);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onPreviousPage = () => {
    let previousOffset = queryOffset - queryLimit;
    if (previousOffset < 0) {
      previousOffset = 0;
    }
    setQueryOffset(previousOffset);
  };
  const onNextPage = () => {
    const nextOffset = queryOffset + queryLimit;
    if (nextOffset > (queryCount ?? 0)) {
      return;
    }
    setQueryOffset(nextOffset);
  };
  const onFilterChanged = (newFilter: string[] | undefined) => {
    setQueryFilter(newFilter);
    setQueryOffset(0);
  };

  const onSortChanged = (newSort: string[] | undefined) => {
    setQuerySort(newSort);
  };

  const onRefresh = () => {
    fetchData(false);
  };

  const rowsLength = queryData
    ? queryData.rows
      ? queryData.rows.length
      : queryData.data.length
    : 0;
  const queryOffsetRangeEnd =
    (rowsLength ?? 0) === queryLimit
      ? queryOffset + queryLimit
      : queryOffset + (rowsLength ?? 0);

  return (
    <div className={currentTab.isActive ? "db-tab-active" : "db-tab"}>
      {project &&
        dbConnection &&
        queryData &&
        dbConnection.type === DBConnType.POSTGRES && (
          <Table
            dbConnection={dbConnection}
            mSchema={String(mschema)}
            mName={String(mname)}
            queryData={queryData}
            querySort={querySort}
            isInteractive={true}
            isReadOnly={projectMemberPermissions.readOnly}
            showHeader={true}
            onRefresh={onRefresh}
            onFilterChanged={onFilterChanged}
            onSortChanged={onSortChanged}
          />
        )}
      {project &&
        dbConnection &&
        queryData &&
        dbConnection.type === DBConnType.MYSQL && (
          <Table
            dbConnection={dbConnection}
            mSchema={String(mschema)}
            mName={String(mname)}
            queryData={queryData}
            querySort={querySort}
            isInteractive={true}
            isReadOnly={projectMemberPermissions.readOnly}
            showHeader={true}
            onRefresh={onRefresh}
            onFilterChanged={onFilterChanged}
            onSortChanged={onSortChanged}
          />
        )}
      {project &&
        dbConnection &&
        queryData &&
        dbConnection.type === DBConnType.MONGO && (
          <JsonTable
            dbConnection={dbConnection}
            mName={String(mname)}
            queryData={queryData}
            isInteractive={true}
            isReadOnly={projectMemberPermissions.readOnly}
            showHeader={true}
            onRefresh={onRefresh}
            onFilterChanged={onFilterChanged}
            onSortChanged={onSortChanged}
          />
        )}

      {/* Fixed bottom pagination bar */}
      <div
        className={`fixed right-0 bottom-5 w-full border-t border-gray-200 bg-white p-3 ${isShowingSidebar ? "withsidebar" : ""}`}
      >
        {dataLoading ? (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={queryOffset === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Showing {queryOffset} - {queryOffsetRangeEnd} of {queryCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={queryOffset + queryLimit >= (queryCount ?? 0)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DBShowDataFragment;
