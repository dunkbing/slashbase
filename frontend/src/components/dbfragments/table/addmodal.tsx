import type React from "react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { DBConnType } from "../../../data/defaults";
import type {
  AddDataResponse,
  ApiResult,
  DBConnection,
  DBQueryData,
  Tab,
} from "../../../data/models";
import { useApp } from "../../../hooks/useApp";
import TabContext from "../../layouts/tabcontext";
import { Button } from "../../ui/button";

type AddModal = {
  queryData: DBQueryData;
  dbConnection: DBConnection;
  mSchema: string;
  mName: string;
  onClose: () => void;
};

const AddModal = ({
  queryData,
  dbConnection,
  mSchema,
  mName,
  onClose,
}: AddModal) => {
  const { addDBData, setQueryData } = useApp();

  const activeTab: Tab = useContext(TabContext)!;

  const [newData, setNewData] = useState<any>({});

  const onFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    col: string,
  ) => {
    const tmpData = { ...newData };
    tmpData[col] = e.target.value;
    setNewData(tmpData);
  };

  const startAdding = async () => {
    const result: ApiResult<AddDataResponse> = await addDBData({
      dbConnectionId: dbConnection.id,
      schemaName: mSchema,
      name: mName,
      data: newData,
    });
    if (result.success) {
      toast.success("data added");
      let mNewData: any;
      if (dbConnection.type === DBConnType.POSTGRES && result.data.data) {
        mNewData = { ...result.data.data, 0: result.data.newId };
      } else {
        mNewData = { ...newData, ctid: result.data.newId };
        queryData.columns.forEach((col, i) => {
          const colIdx = i.toString();
          if (mNewData[col] === undefined) {
            mNewData[colIdx] = null;
          } else {
            mNewData[colIdx] = mNewData[col];
            delete mNewData[col];
          }
        });
      }
      const updatedRows = [mNewData, ...queryData!.rows];
      const updateQueryData: DBQueryData = { ...queryData!, rows: updatedRows };
      setQueryData(activeTab.id, updateQueryData);
      onClose();
    } else {
      toast.error(result.error!);
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            Add new {mSchema}.{mName}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          {queryData.columns
            .filter((col) => col !== "ctid")
            .map((col) => {
              return (
                <div className="field" key={col}>
                  <label className="label">{col}</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={newData[col]}
                      onChange={(e) => {
                        onFieldChange(e, col);
                      }}
                      placeholder="Enter input"
                    />
                  </div>
                </div>
              );
            })}
        </section>
        <footer className="modal-card-foot">
          <Button className="is-primary" onClick={startAdding}>
            Add
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </footer>
      </div>
    </div>
  );
};

export default AddModal;
