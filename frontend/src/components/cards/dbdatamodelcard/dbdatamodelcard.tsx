import { List, Table } from 'lucide-react';
import { DBConnType, TabType } from '../../../data/defaults';
import type { DBConnection, DBDataModel } from '../../../data/models';
import { useAppDispatch } from '../../../redux/hooks';
import { updateActiveTab } from '../../../redux/tabsSlice';
import { Button } from '../../ui/button';
import styles from './dbdatamodelcard.module.scss';

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
    <div className={'card ' + styles.cardContainer}>
      <div className={'card-content ' + styles.cardContent}>
        <div>
          {dbConnection.type === DBConnType.POSTGRES && (
            <b>
              {dataModel.schemaName}.{dataModel.name}
            </b>
          )}
          {dbConnection.type === DBConnType.MONGO && <b>{dataModel.name}</b>}
          {dbConnection.type === DBConnType.MYSQL && <b>{dataModel.name}</b>}
        </div>
        <div className='buttons'>
          <Button onClick={updateActiveTabToData} variant='ghost'>
            <Table />
            View Data
          </Button>
          <Button variant='ghost' onClick={updateActiveTabToModel}>
            <List />
            View Model
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DBDataModelCard;
