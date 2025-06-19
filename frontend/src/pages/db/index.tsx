import React, { type FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DBConsoleFragment from '../../components/dbfragments/console';
import DBGenSQLFragment from '../../components/dbfragments/gensql';
import DBHistoryFragment from '../../components/dbfragments/history';
import DBHomeFragment from '../../components/dbfragments/home';
import DBQueryFragment from '../../components/dbfragments/query';
import DBShowDataFragment from '../../components/dbfragments/showdata';
import DBShowModelFragment from '../../components/dbfragments/showmodel';
import TabContext from '../../components/layouts/tabcontext';
import { TabType } from '../../data/defaults';
import type { Tab } from '../../data/models';
import { getDBConnection, getDBDataModels, getDBQueries } from '../../redux/dbConnectionSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getTabs, selectActiveTab, selectTabs } from '../../redux/tabsSlice';

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
    return <h1>DB not found</h1>;
  }

  return (
    <React.Fragment>
      {tabs.map((tab) => (
        <React.Fragment key={tab.id}>
          <TabContext.Provider value={tab}>
            {tab.type === TabType.BLANK && <DBHomeFragment />}
            {tab.type === TabType.HISTORY && <DBHistoryFragment />}
            {tab.type === TabType.DATA && <DBShowDataFragment />}
            {tab.type === TabType.MODEL && <DBShowModelFragment />}
            {tab.type === TabType.QUERY && <DBQueryFragment />}
            {tab.type === TabType.CONSOLE && <DBConsoleFragment />}
            {tab.type === TabType.GENSQL && <DBGenSQLFragment />}
          </TabContext.Provider>
        </React.Fragment>
      ))}
      {!activeTab && (
        <React.Fragment>
          <h2>No Active Tab!</h2>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default DBPage;
