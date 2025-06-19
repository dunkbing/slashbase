import { useContext } from "react";
import type { DBConnection, Tab } from "../../data/models";
import { useApp } from "../../hooks/useApp";
import TabContext from "../layouts/tabcontext";
import DataModel from "./datamodel/datamodel";

const DBShowModelFragment = () => {
  const { selectDBConnection } = useApp();
  const dbConnection: DBConnection | undefined = selectDBConnection;
  const currentTab: Tab = useContext(TabContext)!;

  const mschema = currentTab.metadata.schema;
  const mname = currentTab.metadata.name;

  return (
    <div className={currentTab.isActive ? "db-tab-active" : "db-tab"}>
      {mname && dbConnection && (
        <DataModel
          dbConn={dbConnection!}
          mschema={mschema!}
          mname={mname}
          isEditable={true}
        />
      )}
    </div>
  );
};

export default DBShowModelFragment;
