import { List, Table } from "lucide-react";
import { DBConnType, TabType } from "../../../data/defaults";
import type { DBConnection, DBDataModel } from "../../../data/models";
import { useAppDispatch } from "../../../redux/hooks";
import { updateActiveTab } from "../../../redux/tabsSlice";
import { Button } from "../../ui/button";

type DBDataModelPropType = {
  dbConnection: DBConnection;
  dataModel: DBDataModel;
};

const DBDataModelCard = ({ dataModel, dbConnection }: DBDataModelPropType) => {
  const dispatch = useAppDispatch();

  const updateActiveTabToData = () => {
    dispatch(
      updateActiveTab({
        tabType: TabType.DATA,
        metadata: { schema: dataModel.schemaName, name: dataModel.name },
      }),
    );
  };

  const updateActiveTabToModel = () => {
    dispatch(
      updateActiveTab({
        tabType: TabType.MODEL,
        metadata: { schema: dataModel.schemaName, name: dataModel.name },
      }),
    );
  };

  return (
    <div className="my-4 max-w-[600px] rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="font-semibold text-gray-900">
          {dbConnection.type === DBConnType.POSTGRES && (
            <span>
              {dataModel.schemaName}.{dataModel.name}
            </span>
          )}
          {dbConnection.type === DBConnType.MONGO && (
            <span>{dataModel.name}</span>
          )}
          {dbConnection.type === DBConnType.MYSQL && (
            <span>{dataModel.name}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={updateActiveTabToData} variant="ghost" size="sm">
            <Table className="mr-2 h-4 w-4" />
            View Data
          </Button>
          <Button variant="ghost" size="sm" onClick={updateActiveTabToModel}>
            <List className="mr-2 h-4 w-4" />
            View Model
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DBDataModelCard;
