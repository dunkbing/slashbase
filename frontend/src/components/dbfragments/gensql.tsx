import { sql } from "@codemirror/lang-sql";
import { duotoneLight } from "@uiw/codemirror-theme-duotone";
import ReactCodeMirror from "@uiw/react-codemirror";
import { useContext, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Play, Edit, Copy, Loader2 } from "lucide-react";
import { TabType } from "../../data/defaults";
import type { Tab } from "../../data/models";
import apiService from "../../network/apiService";
import { selectDBConnection } from "../../redux/dbConnectionSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createTab } from "../../redux/tabsSlice";
import TabContext from "../layouts/tabcontext";
import { Button } from "../ui/button";

type DBGenSQLPropType = {};

const DBGenSQLFragment = ({}: DBGenSQLPropType) => {
  const dispatch = useAppDispatch();

  const currentTab: Tab = useContext(TabContext)!;

  const [inputValue, setInputValue] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [outputValue, setOutputValue] = useState<string | undefined>();

  const dbConnection = useAppSelector(selectDBConnection);

  const onChange = useCallback((value: any) => {
    setOutputValue(value);
  }, []);

  const runGenerateSQL = async () => {
    if (generating) {
      return;
    }
    setGenerating(true);
    const result = await apiService.generateSQL(dbConnection!.id, inputValue);
    if (result.success) setOutputValue(result.data);
    else toast.error(result.error!);
    setGenerating(false);
  };

  const openInQueryEditor = () => {
    dispatch(
      createTab({
        dbConnId: dbConnection!.id,
        tabType: TabType.QUERY,
        metadata: { queryId: "new", query: outputValue },
      }),
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputValue!);
    toast.success("copied");
  };

  return (
    <div className={currentTab.isActive ? "db-tab-active" : "db-tab"}>
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={inputValue}
            className="w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter prompt to generate SQL"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setInputValue(e.target.value);
            }}
          />
          {generating && (
            <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center rounded-md bg-white">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        <div>
          <Button
            onClick={runGenerateSQL}
            disabled={generating}
            variant={outputValue === undefined ? "default" : "outline"}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {outputValue !== undefined && (
          <div className="space-y-4">
            <ReactCodeMirror
              value={outputValue}
              extensions={[sql()]}
              theme={duotoneLight}
              height={"auto"}
              minHeight="80px"
              placeholder={"Generated SQL"}
              basicSetup={{
                autocompletion: false,
                highlightActiveLine: false,
              }}
              onChange={onChange}
              className="overflow-hidden rounded-md border border-gray-300"
            />

            <div className="flex gap-3">
              <Button onClick={openInQueryEditor}>
                <Edit className="mr-2 h-4 w-4" />
                Open in Query Editor
              </Button>
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy to clipboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DBGenSQLFragment;
