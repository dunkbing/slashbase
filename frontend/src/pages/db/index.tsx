import { type FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import DBConsoleFragment from "../../components/dbfragments/console";
import DBGenSQLFragment from "../../components/dbfragments/gensql";
import DBHistoryFragment from "../../components/dbfragments/history";
import DBHomeFragment from "../../components/dbfragments/home";
import DBQueryFragment from "../../components/dbfragments/query";
import DBShowDataFragment from "../../components/dbfragments/showdata";
import DBShowModelFragment from "../../components/dbfragments/showmodel";
import TabContext from "../../components/layouts/tabcontext";
import { TabType } from "../../data/defaults";
import type { Tab } from "../../data/models";
import {
  getDBConnection,
  getDBDataModels,
  getDBQueries,
} from "../../redux/dbConnectionSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { getTabs, selectActiveTab, selectTabs } from "../../redux/tabsSlice";

const DBPage: FunctionComponent<{}> = () => {
  const { id } = useParams();
  const [error404, setError404] = useState(false);
  const dispatch = useAppDispatch();

  const tabs: Tab[] = useAppSelector(selectTabs);
  const activeTab = useAppSelector(selectActiveTab);

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          await dispatch(getDBConnection({ dbConnId: String(id) })).unwrap();
        } catch (e) {
          setError404(true);
          return;
        }
        dispatch(getTabs({ dbConnId: String(id) }));
        dispatch(getDBDataModels({ dbConnId: String(id) }));
        dispatch(getDBQueries({ dbConnId: String(id) }));
      }
    })();
  }, [dispatch, id]);

  if (error404) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Database not found
          </h1>
          <p className="text-gray-600">
            The database connection you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {tabs.map((tab) => (
        <div key={tab.id} className={tab.isActive ? "block" : "hidden"}>
          <TabContext.Provider value={tab}>
            {tab.type === TabType.BLANK && <DBHomeFragment />}
            {tab.type === TabType.HISTORY && <DBHistoryFragment />}
            {tab.type === TabType.DATA && <DBShowDataFragment />}
            {tab.type === TabType.MODEL && <DBShowModelFragment />}
            {tab.type === TabType.QUERY && <DBQueryFragment />}
            {tab.type === TabType.CONSOLE && <DBConsoleFragment />}
            {tab.type === TabType.GENSQL && <DBGenSQLFragment />}
          </TabContext.Provider>
        </div>
      ))}

      {!activeTab && (
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              No Active Tab!
            </h2>
            <p className="text-gray-600">
              Select a tab to get started or create a new one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DBPage;
