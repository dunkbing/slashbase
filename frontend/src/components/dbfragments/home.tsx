import { useContext } from "react";
import { TabType } from "../../data/defaults";
import type { DBConnection, DBDataModel, Tab } from "../../data/models";
import {
  selectDBConnection,
  selectDBDataModels,
  selectIsFetchingDBDataModels,
} from "../../redux/dbConnectionSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { updateActiveTab } from "../../redux/tabsSlice";
import DBDataModelCard from "../cards/dbdatamodelcard/dbdatamodelcard";
import TabContext from "../layouts/tabcontext";
import { Button } from "../ui/button";
import { CirclePlus, History, Loader2 } from "lucide-react";

type DBHomePropType = {};

const DBHomeFragment = ({}: DBHomePropType) => {
  const dispatch = useAppDispatch();

  const currentTab: Tab = useContext(TabContext)!;

  const dbConnection: DBConnection | undefined =
    useAppSelector(selectDBConnection);
  const dbDataModels: DBDataModel[] = useAppSelector(selectDBDataModels);

  const isFetching: boolean = useAppSelector(selectIsFetchingDBDataModels);

  const updateActiveTabToQuery = () => {
    dispatch(
      updateActiveTab({
        tabType: TabType.QUERY,
        metadata: { queryId: "new", query: "" },
      }),
    );
  };

  const updateActiveTabToHistory = () => {
    dispatch(updateActiveTab({ tabType: TabType.HISTORY, metadata: {} }));
  };

  return (
    <div className={currentTab.isActive ? "db-tab-active" : "db-tab"}>
      {dbConnection && (
        <>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Data Models
          </h2>
          {isFetching && (
            <div className="flex min-h-[70px] w-full max-w-md items-center gap-2 pt-5 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting to DB...
            </div>
          )}
          {dbDataModels.map((x) => (
            <DBDataModelCard
              key={x.schemaName + x.name}
              dataModel={x}
              dbConnection={dbConnection}
            />
          ))}
          <div className="mt-6 flex gap-3">
            <Button onClick={updateActiveTabToQuery}>
              <CirclePlus className="mr-2 h-4 w-4" />
              New Query
            </Button>
            <Button onClick={updateActiveTabToHistory} variant="outline">
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DBHomeFragment;
