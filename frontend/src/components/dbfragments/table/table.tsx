import { Check, CircleX, Pen, Plus, RefreshCcw, Trash2 } from "lucide-react";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { type Cell, useRowSelect, useTable } from "react-table";
import { DBConnType } from "../../../data/defaults";
import type { DBConnection, DBQueryData, Tab } from "../../../data/models";
import { useApp } from "../../../hooks/useApp";
import TabContext from "../../layouts/tabcontext";
import { Button } from "../../ui/button";
import ConfirmModal from "../../widgets/confirmModal";
import AddModal from "./addmodal";
import EditableCell from "./editablecell";
import styles from "./table.module.scss";

type TablePropType = {
  queryData: DBQueryData;
  dbConnection: DBConnection;
  mSchema: string;
  mName: string;
  isInteractive: boolean;
  isReadOnly: boolean;
  showHeader?: boolean;
  onRefresh: () => void;
  querySort?: string[];
  onFilterChanged: (newFilter: string[] | undefined) => void;
  onSortChanged: (newSort: string[] | undefined) => void;
};

const Table = ({
  queryData,
  dbConnection,
  mSchema,
  mName,
  isInteractive,
  isReadOnly,
  showHeader,
  querySort,
  onFilterChanged,
  onSortChanged,
  onRefresh,
}: TablePropType) => {
  const { updateDBSingleData, deleteDBData, setQueryData } = useApp();

  const activeTab: Tab = useContext(TabContext)!;

  const [editCell, setEditCell] = useState<(string | number)[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [filterValue, setFilterValue] = useState<string[]>([
    "default",
    "default",
    "",
  ]);

  const data = React.useMemo(() => queryData.rows, [queryData]);

  const displayColumns = queryData.columns
    ? dbConnection.type === DBConnType.POSTGRES
      ? queryData.columns.filter((col) => col !== "ctid")
      : queryData.columns
    : [];
  const ctidExists = queryData.columns
    ? queryData.columns.length !== displayColumns.length
    : false;

  const columns = React.useMemo(
    () =>
      displayColumns.map((col, i) => ({
        Header: (
          <>
            {col}
            {querySort && querySort[0] === col ? (
              querySort[1] === "ASC" ? (
                <>
                  &nbsp;
                  <i className="fas fa-caret-up" />
                </>
              ) : (
                <>
                  &nbsp;
                  <i className="fas fa-caret-down" />
                </>
              )
            ) : undefined}
          </>
        ),
        accessor: (ctidExists ? i + 1 : i).toString(),
      })),
    [queryData, querySort],
  );

  const defaultColumn = {
    Cell: EditableCell,
  };

  const resetEditCell = () => {
    setEditCell([]);
  };

  const onSaveCell = async (
    rowIdx: number,
    originalValue: any,
    columnIdx: string,
    newValue: string,
  ) => {
    if (
      dbConnection.type === DBConnType.MYSQL &&
      queryData.pkeys?.length === 0
    ) {
      return toast.error(
        "to perform edit operation primary keys are required on the table!",
      );
    }
    const columnName = queryData.columns[Number.parseInt(columnIdx)];
    const uniqueId =
      dbConnection.type === DBConnType.POSTGRES
        ? originalValue["0"]
        : JSON.stringify(
            queryData
              .pkeys!.map((pkey) => ({
                [pkey]:
                  originalValue[queryData.columns.findIndex((x) => x === pkey)],
              }))
              .reduce((r, c) => Object.assign(r, c), {}),
          );
    const result = await updateDBSingleData({
      dbConnectionId: dbConnection.id,
      schemaName: mSchema,
      name: mName,
      id: uniqueId,
      columnName,
      newValue,
    });
    if (result.success) {
      if (rowIdx !== -1) {
        const newQueryData: DBQueryData = {
          ...queryData!,
          rows: [...queryData!.rows],
        };
        if (dbConnection.type === DBConnType.POSTGRES) {
          newQueryData!.rows[rowIdx] = {
            ...newQueryData!.rows[rowIdx],
            0: result.data.ctid,
          };
        } else {
          newQueryData!.rows[rowIdx] = { ...newQueryData!.rows[rowIdx] };
        }
        newQueryData!.rows[rowIdx][columnIdx] = newValue;
        setQueryData(activeTab.id, newQueryData);
      } else {
        // fetchData(false)
      }
      resetEditCell();
      toast.success("1 row updated");
    } else {
      toast.error(result.error!);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { selectedRowIds: {} },
      ...{ editCell, resetEditCell, onSaveCell },
    },
    useRowSelect,
    (hooks) => {
      if (isInteractive && isEditing)
        hooks.visibleColumns.push((columns) => [
          {
            id: "selection",
            Header: HeaderSelectionComponent,
            Cell: CellSelectionComponent,
          },
          ...columns,
        ]);
    },
  );

  const selectedRows: number[] = Object.keys(state.selectedRowIds).map((x) =>
    Number.parseInt(x),
  );
  const selectedIDs =
    dbConnection.type === DBConnType.POSTGRES
      ? rows
          .filter((_, i) => selectedRows.includes(i))
          .map((x) => (x.original as any)["0"])
          .filter((x) => x)
      : rows
          .filter((_, i) => selectedRows.includes(i))
          .map((x) =>
            queryData.pkeys!.map((pkey) => ({
              [pkey]: (x.original as any)[
                queryData.columns.findIndex((x) => x === pkey)
              ],
            })),
          )
          .map((x) => x.reduce((r, c) => Object.assign(r, c), {}))
          .map((x) => JSON.stringify(x));

  const deleteRows = async () => {
    if (
      dbConnection.type === DBConnType.MYSQL &&
      queryData.pkeys?.length === 0
    ) {
      return toast.error(
        "to perform delete operation primary keys are required on the table!",
      );
    }
    if (selectedIDs.length > 0) {
      const result = await deleteDBData({
        dbConnectionId: dbConnection.id,
        schemaName: mSchema,
        name: mName,
        selectedIDs: selectedIDs,
      });
      if (result.success) {
        toast.success("rows deleted");
        const filteredRows = queryData!.rows.filter(
          (_, i) => !selectedRows.includes(i),
        );
        const newQueryData: DBQueryData = { ...queryData!, rows: filteredRows };
        setQueryData(activeTab.id, newQueryData);
      } else {
        toast.error(result.error!);
      }
    }
    setIsDeleting(false);
  };

  const startEditing = (cell: Cell<any, any>) => {
    if (isInteractive && isEditing)
      setEditCell([cell.row.index, cell.column.id]);
  };

  const onFilter = () => {
    let filter: string[] | undefined = undefined;
    if (filterValue[0] !== "default" && filterValue[1] !== "default") {
      const operator = filterValue[1];
      if (operator === "IS NULL" || operator === "IS NOT NULL") {
        filter = [filterValue[0], operator];
      } else {
        filter = [filterValue[0], operator, filterValue[2]];
      }
    }
    onFilterChanged(filter);
  };
  const onFilterClear = () => {
    const filter: string[] | undefined = undefined;
    setFilterValue(["default", "default", ""]);
    onFilterChanged(filter);
  };

  const changeSort = (newSortIdx: string) => {
    if (!isInteractive || newSortIdx === "selection") {
      return;
    }
    const newSortName: string = displayColumns.find((_, i) => {
      const colIdx = ctidExists ? i + 1 : i;
      return colIdx.toString() === newSortIdx;
    })!;
    if (querySort && newSortName === querySort[0]) {
      if (querySort[1] === "ASC") {
        onSortChanged([querySort[0], "DESC"]);
      } else if (querySort[1] === "DESC") {
        onSortChanged(undefined);
      }
    } else {
      onSortChanged([newSortName, "ASC"]);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const value = e.target.value;
    const newFilterValue = [...filterValue];
    newFilterValue[index] = value;
    setFilterValue(newFilterValue);
  };

  return (
    <React.Fragment>
      {(showHeader || (isInteractive && isEditing)) && (
        <div className={styles.tableHeader}>
          <div className="columns">
            <div className="column is-9">
              <div className="field has-addons">
                <p className="control">
                  <span className="select">
                    <select
                      value={filterValue[0]}
                      onChange={(e) => handleFilterChange(e, 0)}
                    >
                      <option value="default">Select column</option>
                      {displayColumns.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </span>
                </p>
                <p className="control">
                  <span className="select">
                    <select
                      value={filterValue[1]}
                      onChange={(e) => handleFilterChange(e, 1)}
                    >
                      <option value="default">Select operator</option>
                      <option value="=">=</option>
                      <option value="!=">≠</option>
                      <option value="<">&lt;</option>
                      <option value=">">&gt;</option>
                      <option value=">=">≥</option>
                      <option value="<=">≤</option>
                      <option value="IS NULL">is null</option>
                      <option value="IS NOT NULL">not null</option>
                      <option value="LIKE">like</option>
                      <option value="NOT LIKE">not like</option>
                    </select>
                  </span>
                </p>
                <p className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Value"
                    value={filterValue[2]}
                    onChange={(e) => handleFilterChange(e, 2)}
                  />
                </p>
                <p className="control">
                  <Button onClick={onFilter}>Filter</Button>
                </p>
                {(filterValue[0] !== "default" ||
                  filterValue[1] !== "default") && (
                  <p className="control">
                    <Button onClick={onFilterClear}>
                      <CircleX />
                    </Button>
                  </p>
                )}
              </div>
            </div>
            {isInteractive && !isEditing && (
              <React.Fragment>
                <div className="column is-3 is-flex is-justify-content-flex-end gap-3">
                  <Button
                    className="is-secondary mgr-medium"
                    onClick={onRefresh}
                  >
                    <RefreshCcw />
                  </Button>
                  {!isReadOnly && (
                    <Button
                      className="is-primary"
                      onClick={() => {
                        setIsEditing(true);
                      }}
                    >
                      <Pen />
                    </Button>
                  )}
                </div>
              </React.Fragment>
            )}

            {isInteractive && isEditing && (
              <React.Fragment>
                <div className="column is-3 is-flex is-justify-content-flex-end">
                  <Button
                    disabled={selectedIDs.length === 0}
                    onClick={() => {
                      setIsDeleting(true);
                    }}
                  >
                    <Trash2 />
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    className="is-secondary"
                    onClick={() => {
                      setIsAdding(true);
                    }}
                  >
                    <Plus />
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    className="is-primary"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                  >
                    <Check />
                  </Button>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      )}

      {isAdding && (
        <AddModal
          queryData={queryData}
          dbConnection={dbConnection}
          mSchema={mSchema}
          mName={mName}
          onClose={() => {
            setIsAdding(false);
          }}
        />
      )}
      {isDeleting && (
        <ConfirmModal
          message={`Are you sure you want to delete selected rows?`}
          onConfirm={deleteRows}
          onClose={() => {
            setIsDeleting(false);
          }}
        />
      )}
      <div className="table-container">
        <table
          {...getTableProps()}
          className={
            "is-bordered is-striped is-narrow is-hoverable is-fullwidth table"
          }
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={"header"}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    key={column.id}
                    onClick={() => {
                      changeSort(column.id);
                    }}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const selectedRow: any = row; // temp type hack
              return (
                <tr
                  {...row.getRowProps()}
                  key={row.id}
                  className={selectedRow.isSelected ? "is-selected" : ""}
                >
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        onDoubleClick={() => startEditing(cell)}
                        key={row.id + "" + cell.column.id}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate: boolean }
>(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef(null);
  const resolvedRef: any = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  );
});
IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

const HeaderSelectionComponent = ({ getToggleAllRowsSelectedProps }: any) => (
  <div>
    <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
  </div>
);

const CellSelectionComponent = ({ row }: any) => (
  <div>
    <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
  </div>
);

export default Table;
