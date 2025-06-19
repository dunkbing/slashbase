import { javascript } from "@codemirror/lang-javascript";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import React, { useContext, useRef, useState } from "react";
import toast from "react-hot-toast";
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
  dbConnection: DBConnection;
  mName: string;
  onClose: () => void;
};

const AddModal = ({ dbConnection, mName, onClose }: AddModal) => {
  const { selectQueryData, addDBData, setQueryData } = useApp();

  const activeTab: Tab = useContext(TabContext)!;
  const queryData = selectQueryData;

  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const [newData, setNewData] = useState<any>(`{\n\t\n}`);

  const startAdding = async () => {
    let jsonData: any;
    try {
      jsonData = JSON.parse(newData);
    } catch (e: any) {
      toast.error(e.message);
      return;
    }
    const result: ApiResult<AddDataResponse> = await addDBData({
      dbConnectionId: dbConnection.id,
      schemaName: "",
      name: mName,
      data: jsonData,
    });
    if (result.success) {
      toast.success("data added");
      const mNewData = { _id: result.data.newId, ...jsonData };
      const updatedRows = [mNewData, ...queryData!.data];
      const updateQueryData: DBQueryData = { ...queryData!, data: updatedRows };
      setQueryData(activeTab.id, updateQueryData);
      onClose();
    } else {
      toast.error(result.error!);
    }
  };

  const onChange = React.useCallback((value: any) => {
    setNewData(value);
  }, []);

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Add new data to {mName}</p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          <CodeMirror
            ref={editorRef}
            value={newData}
            extensions={[javascript()]}
            onChange={onChange}
          />
        </section>
        <footer className="modal-card-foot">
          <Button onClick={startAdding}>Add</Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default AddModal;
