import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import { Key, Circle, DotIcon, Check, Pen, Plus, Trash2 } from "lucide-react";
import { DBConnType } from "../../../data/defaults";
import type { DBConnection, Tab } from "../../../data/models";
import {
  deleteDBDataModelField,
  deleteDBDataModelIndex,
  getSingleDataModel,
  selectSingleDataModel,
} from "../../../redux/dataModelSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import TabContext from "../../layouts/tabcontext";
import { Button } from "../../ui/button";
import ConfirmModal from "../../widgets/confirmModal";
import AddFieldModal from "./addfieldmodal";
import AddIndexModal from "./addindexmodal";

type DataModelPropType = {
  dbConn: DBConnection;
  mschema: string;
  mname: string;
  isEditable: boolean;
};

const DataModel = ({
  dbConn,
  mschema,
  mname,
  isEditable,
}: DataModelPropType) => {
  const dispatch = useAppDispatch();

  const currentTab: Tab = useContext(TabContext)!;
  const dataModel = useAppSelector(selectSingleDataModel);

  const [isEditingModel, setIsEditingModel] = useState<boolean>(false);
  const [isEditingIndex, setIsEditingIndex] = useState<boolean>(false);
  const [showingAddFieldModal, setShowingAddFieldModal] =
    useState<boolean>(false);
  const [showingAddIndexModal, setShowingAddIndexModal] =
    useState<boolean>(false);
  const [deletingField, setDeletingField] = useState<string>("");
  const [deletingIndex, setDeletingIndex] = useState<string>("");
  const [refresh, setRefresh] = useState<number>(Date.now());

  useEffect(() => {
    if (!dbConn) return;
    dispatch(
      getSingleDataModel({
        tabId: currentTab.id,
        dbConnectionId: dbConn!.id,
        schemaName: String(mschema),
        name: String(mname),
      }),
    );
  }, [dispatch, dbConn, mschema, mname, refresh]);

  const refreshModel = () => {
    setRefresh(Date.now());
  };

  if (!dataModel) {
    return null;
  }
  const label =
    dbConn.type === DBConnType.POSTGRES
      ? `${dataModel.schemaName}.${dataModel.name}`
      : `${dataModel.name}`;

  const deleteField = async () => {
    const result = await dispatch(
      deleteDBDataModelField({
        tabId: currentTab.id,
        dbConnectionId: dbConn.id,
        schemaName: dataModel.schemaName!,
        name: dataModel.name,
        fieldName: deletingField,
      }),
    ).unwrap();
    if (result.success) {
      toast.success(`deleted field ${deletingField}`);
      refreshModel();
      setDeletingField("");
    } else {
      toast.error(result.error!);
    }
  };

  const deleteIndex = async () => {
    const result = await dispatch(
      deleteDBDataModelIndex({
        dbConnectionId: dbConn.id,
        schemaName: dataModel.schemaName!,
        name: dataModel.name,
        indexName: deletingIndex,
      }),
    ).unwrap();
    if (result.success) {
      toast.success(`deleted index ${deletingIndex}`);
      refreshModel();
      setDeletingIndex("");
    } else {
      toast.error(result.error!);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Fields Table */}
        <div className="overflow-x-auto">
          <table className="w-full rounded-lg border border-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th
                  colSpan={
                    dbConn.type === DBConnType.POSTGRES ||
                    dbConn.type === DBConnType.MYSQL
                      ? 4
                      : 5
                  }
                  className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    {isEditable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingModel(!isEditingModel);
                        }}
                      >
                        {isEditingModel ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Pen className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </th>
                {(dbConn.type === DBConnType.POSTGRES ||
                  dbConn.type === DBConnType.MYSQL) &&
                  isEditingModel && (
                    <th className="border-b border-gray-200 px-6 py-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowingAddFieldModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </th>
                  )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataModel.fields?.map((field) => (
                <tr
                  key={field.name}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-3 whitespace-nowrap">
                    {field.isPrimary ? (
                      <Key
                        className="h-4 w-4 rotate-45 text-yellow-600"
                        data-tip="Primary key"
                      />
                    ) : field.isNullable ? (
                      <DotIcon
                        className="h-4 w-4 text-gray-400"
                        data-tip="Nullable"
                      />
                    ) : (
                      <Circle
                        className="h-4 w-4 fill-current text-gray-600"
                        data-tip="Not Nullable"
                      />
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {field.name}
                  </td>
                  <td
                    className={`px-6 py-3 text-sm text-gray-600 ${
                      dbConn.type === DBConnType.MONGO ? "col-span-2" : ""
                    }`}
                  >
                    {field.type}
                  </td>
                  {(dbConn.type === DBConnType.POSTGRES ||
                    dbConn.type === DBConnType.MYSQL) && (
                    <td className="px-6 py-3">
                      {field.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {field.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                  {isEditingModel && (
                    <td className="px-6 py-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeletingField(field.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indexes Table */}
        {dataModel.indexes && dataModel.indexes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full rounded-lg border border-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    colSpan={2}
                    className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <span>Indexes</span>
                      {isEditable && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingIndex(!isEditingIndex);
                          }}
                        >
                          {isEditingIndex ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Pen className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </th>
                  {isEditingIndex && (
                    <th className="border-b border-gray-200 px-6 py-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowingAddIndexModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataModel.indexes?.map((idx) => (
                  <tr
                    key={idx.name}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {idx.name}
                    </td>
                    <td className="px-6 py-3 font-mono text-sm text-gray-600">
                      {idx.indexDef}
                    </td>
                    {isEditingIndex && (
                      <td className="px-6 py-3">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeletingIndex(idx.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        {(dbConn.type === DBConnType.POSTGRES ||
          dbConn.type === DBConnType.MYSQL) &&
          showingAddFieldModal && (
            <AddFieldModal
              dbConn={dbConn}
              mSchema={dataModel.schemaName}
              mName={dataModel.name}
              onAddField={refreshModel}
              onClose={() => {
                setShowingAddFieldModal(false);
              }}
            />
          )}
        {showingAddIndexModal && (
          <AddIndexModal
            dbConn={dbConn}
            mSchema={dataModel.schemaName}
            mName={dataModel.name}
            onAddIndex={refreshModel}
            onClose={() => {
              setShowingAddIndexModal(false);
            }}
          />
        )}
        {deletingField !== "" && (
          <ConfirmModal
            message={`Delete field: ${deletingField}?`}
            onConfirm={deleteField}
            onClose={() => {
              setDeletingField("");
            }}
          />
        )}
        {deletingIndex !== "" && (
          <ConfirmModal
            message={`Delete index: ${deletingIndex}?`}
            onConfirm={deleteIndex}
            onClose={() => {
              setDeletingIndex("");
            }}
          />
        )}
        <Tooltip place="bottom" variant="dark" />
      </div>
    </>
  );
};

export default DataModel;
