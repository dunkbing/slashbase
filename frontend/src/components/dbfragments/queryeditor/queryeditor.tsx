import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { duotoneLight } from "@uiw/codemirror-theme-duotone";
import ReactCodeMirror, {
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { js_beautify } from "js-beautify";
import { useState, useRef, useEffect, useContext, useCallback } from "react";
import toast from "react-hot-toast";
import { format } from "sql-formatter";
import { Save, AlignLeft, Book, Trash2, Play, Loader2 } from "lucide-react";
import { DBConnType } from "../../../data/defaults";
import type { DBConnection, Tab } from "../../../data/models";
import apiService from "../../../network/apiService";
import {
  deleteDBQuery,
  saveDBQuery,
  selectDBConnection,
} from "../../../redux/dbConnectionSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import TabContext from "../../layouts/tabcontext";
import CheatSheetModal from "../cheatsheet/cheatsheet";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

type QueryEditorPropType = {
  initialValue: string;
  initQueryName: string;
  queryId: string;
  dbType: DBConnType;
  runQuery: (query: string, callback: () => void) => void;
  onSave: (queryId: string, query: string) => void;
  onDelete: () => void;
};

const QueryEditor = ({
  initialValue,
  initQueryName,
  queryId,
  dbType,
  runQuery,
  onSave,
  onDelete,
}: QueryEditorPropType) => {
  const dispatch = useAppDispatch();

  const [value, setValue] = useState(initialValue);
  const [queryName, setQueryName] = useState(initQueryName);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  const dbConnection: DBConnection | undefined =
    useAppSelector(selectDBConnection);
  const currentTab: Tab = useContext(TabContext)!;

  const onChange = useCallback((value: any) => {
    setValue(value);
  }, []);

  useEffect(() => {
    if (value != initialValue) {
      apiService.updateTab(dbConnection!.id, currentTab.id, currentTab.type, {
        queryId: currentTab.metadata.queryId,
        query: value,
      });
    }
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key.toLocaleLowerCase() === "enter") {
      startRunningQuery();
    }
  };

  const startSaving = async () => {
    if (queryName === "") {
      return;
    }
    setSaving(true);
    try {
      const result = await dispatch(
        saveDBQuery({
          dbConnId: dbConnection!.id,
          queryId,
          name: queryName,
          query: value,
        }),
      ).unwrap();
      toast.success("Saved Successfully!");
      onSave(result.dbQuery.id, result.dbQuery.query);
    } catch (e) {
      toast.error("There was some problem saving! Please try again.");
    }
    setSaving(false);
  };

  const startDeleting = async () => {
    if (queryId === "new") {
      return;
    }
    setDeleting(true);
    try {
      await dispatch(deleteDBQuery({ queryId })).unwrap();
      toast.success("Query Deleted");
      onDelete();
    } catch (e) {
      toast.error("There was some problem deleting! Please try again.");
    }
    setDeleting(false);
  };

  const startRunningQuery = () => {
    setRunning(true);
    runQuery(value, () => {
      setRunning(false);
    });
  };

  const formatQuery = () => {
    let formattedQuery: string = value;
    if (dbType === DBConnType.POSTGRES) {
      formattedQuery = format(value, {
        language: "postgresql",
        keywordCase: "upper",
        linesBetweenQueries: 2,
      });
    } else if (dbType === DBConnType.MONGO) {
      formattedQuery = js_beautify(value);
    } else if (dbType == DBConnType.MYSQL) {
      formattedQuery = format(value, {
        language: "mysql",
        keywordCase: "upper",
        linesBetweenQueries: 2,
      });
    }
    setValue(formattedQuery);
  };

  const placeholderText =
    dbType === DBConnType.POSTGRES || dbType === DBConnType.MYSQL
      ? "select * from <table name>;"
      : "db.<collection name>.find()";

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Code Editor */}
        <ReactCodeMirror
          ref={editorRef}
          value={value}
          extensions={
            dbType === DBConnType.POSTGRES || dbType === DBConnType.MYSQL
              ? [sql()]
              : [javascript()]
          }
          theme={duotoneLight}
          height={"auto"}
          minHeight="80px"
          placeholder={placeholderText}
          basicSetup={{
            autocompletion: false,
            highlightActiveLine: false,
          }}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className="overflow-hidden rounded-md border border-gray-300"
        />

        {/* Bottom Bar */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Query Name Input */}
          <div className="max-w-md flex-1">
            <Input
              type="text"
              placeholder="Enter query name"
              value={queryName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setQueryName(e.target.value);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Save Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startSaving}
                  disabled={saving || queryName === ""}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save query</p>
              </TooltipContent>
            </Tooltip>

            {/* Format Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={formatQuery}>
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format query</p>
              </TooltipContent>
            </Tooltip>

            {/* Cheatsheet Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCheatsheet(true);
                  }}
                >
                  <Book className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show Cheatsheet</p>
              </TooltipContent>
            </Tooltip>

            {/* Delete Button */}
            {queryId !== "new" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startDeleting}
                    disabled={deleting}
                    className="border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete query</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Run Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={startRunningQuery}
                  disabled={running}
                  size="sm"
                  className="min-w-[100px]"
                >
                  {running ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run query
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ctrl+Enter to run query</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Cheatsheet Modal */}
        {showCheatsheet && (
          <CheatSheetModal
            dbType={dbConnection!.type}
            onClose={() => {
              setShowCheatsheet(false);
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default QueryEditor;
