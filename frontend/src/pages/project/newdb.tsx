import type React from "react";
import { type FunctionComponent, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Database, Settings, Loader2, TestTube, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import InputTextField from "../../components/input-text-field";
import PasswordInputField from "../../components/password-input-field";
import Constants from "../../constants";
import { useDBConnections } from "../../contexts/db-connection-context";
import { DBConnType, DBConnectionUseSSHType } from "../../data/defaults";
import type { Project } from "../../data/models";
import type { AddDBConnPayload } from "../../network/payloads";
import { useAppSelector } from "../../redux/hooks";
import { selectProjects } from "../../redux/projectsSlice";

const NewDBPage: FunctionComponent<{}> = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addNewDBConn, testNewDBConn } = useDBConnections();
  const projects: Project[] = useAppSelector(selectProjects);
  const project = projects.find((x) => x.id === id);
  const [addingError, setAddingError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [inputError, setInputError] = useState({
    error_1: false,
    error_2: false,
    error_3: false,
    error_4: false,
  });
  const [data, setData] = useState({
    dbName: "",
    dbType: DBConnType.POSTGRES,
    dbScheme: "",
    dbHost: "",
    dbPort: "",
    dbDatabase: "",
    dbUsername: "",
    dbPassword: "",
    dbUseSSH: DBConnectionUseSSHType.NONE,
    dbSSHHost: "",
    dbSSHUser: "",
    dbSSHPassword: "",
    dbSSHKeyFile: "",
    dbUseSSL: false,
    isTest: false,
  });
  const [showAdditional, setShowAdditional] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const type = e.target.type;
    const name = e.target.name;

    switch (name) {
      case "dbName":
        e.target.value.trim().length > 0
          ? setInputError({ ...inputError, error_1: false })
          : setInputError({ ...inputError, error_1: true });
        break;
      case "dbHost":
        e.target.value.trim().length > 0
          ? setInputError({ ...inputError, error_2: false })
          : setInputError({ ...inputError, error_2: true });
        break;
      case "dbPort":
        e.target.value.trim().length > 0
          ? setInputError({ ...inputError, error_3: false })
          : setInputError({ ...inputError, error_3: true });
        break;
      case "dbDatabase":
        e.target.value.trim().length > 0
          ? setInputError({ ...inputError, error_4: false })
          : setInputError({ ...inputError, error_4: true });
        break;
    }

    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (!project) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Project not found
          </h1>
          <p className="mt-2 text-gray-600">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // if (project.currentMember?.role.name !== Constants.ROLES.ADMIN) {
  // 	return <DefaultErrorPage statusCode={401} title="Unauthorized" />
  // }
  const errorHandler = (e: any, payload: any) => {
    var f1 = false,
      f2 = false,
      f3 = false,
      f4 = false;
    payload.name.length === 0 ? (f1 = true) : (f1 = false);
    payload.host.length === 0 ? (f2 = true) : (f2 = false);
    payload.port.length === 0 ? (f3 = true) : (f3 = false);
    payload.dbname.length === 0 ? (f4 = true) : (f4 = false);
    setInputError({
      ...inputError,
      error_1: f1,
      error_2: f2,
      error_3: f3,
      error_4: f4,
    });
    setAddingError(e);
  };
  const startAddingDB = async () => {
    setAdding(true);
    setAddingError(false);
    const payload: AddDBConnPayload = {
      projectId: project.id,
      name: data.dbName,
      type: data.dbType,
      scheme: data.dbScheme,
      host: data.dbHost,
      port: data.dbPort,
      password: data.dbPassword,
      user: data.dbUsername,
      dbname: data.dbDatabase,
      useSSH: data.dbUseSSH,
      sshHost: data.dbSSHHost,
      sshUser: data.dbSSHUser,
      sshPassword: data.dbSSHPassword,
      sshKeyFile: data.dbSSHKeyFile,
      useSSL: data.dbUseSSL,
      isTest: false,
    };
    try {
      await addNewDBConn(payload);
      navigate(Constants.APP_PATHS.PROJECT.path.replace("[id]", project.id));
    } catch (e: any) {
      errorHandler(e, payload);
    }

    setAdding(false);
  };
  const testDBConn = async () => {
    setTesting(true);
    setAddingError(false);
    const payload: AddDBConnPayload = {
      projectId: project.id,
      name: data.dbName,
      type: data.dbType,
      scheme: data.dbScheme,
      host: data.dbHost,
      port: data.dbPort,
      password: data.dbPassword,
      user: data.dbUsername,
      dbname: data.dbDatabase,
      useSSH: data.dbUseSSH,
      sshHost: data.dbSSHHost,
      sshUser: data.dbSSHUser,
      sshPassword: data.dbSSHPassword,
      sshKeyFile: data.dbSSHKeyFile,
      useSSL: data.dbUseSSL,
      isTest: true,
    };
    try {
      await testNewDBConn(payload);
      success();
    } catch (e: any) {
      errorHandler(e, payload);
    }

    setTesting(false);
  };

  const success = () => {
    toast("Successfully connected", {
      position: "bottom-center",
      icon: "✅",
    });
  };

  const DbTypeCard = ({
    type,
    label,
    isActive,
    onClick,
  }: {
    type: DBConnType;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`flex h-12 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
      } `}
      onClick={onClick}
    >
      <h6 className="text-sm font-medium">{label}</h6>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-center">
        <Database className="mr-3 h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Add new database connection
        </h1>
      </div>

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        {/* Database Type Selection */}
        <div>
          <label className="mb-4 block text-sm font-medium text-gray-700">
            Database Type:
          </label>
          <div className="flex space-x-4">
            <DbTypeCard
              type={DBConnType.POSTGRES}
              label="PostgreSQL"
              isActive={data.dbType === DBConnType.POSTGRES}
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  dbType: DBConnType.POSTGRES,
                  dbScheme: "",
                }));
              }}
            />
            <DbTypeCard
              type={DBConnType.MONGO}
              label="MongoDB"
              isActive={data.dbType === DBConnType.MONGO}
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  dbType: DBConnType.MONGO,
                  dbScheme: "",
                }));
              }}
            />
            <DbTypeCard
              type={DBConnType.MYSQL}
              label="MySQL"
              isActive={data.dbType === DBConnType.MYSQL}
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  dbType: DBConnType.MYSQL,
                  dbScheme: "",
                }));
              }}
            />
          </div>
        </div>

        {/* Basic Connection Fields */}
        <InputTextField
          label="Display Name:"
          name="dbName"
          value={data.dbName}
          onChange={handleChange}
          placeholder="Enter a display name for database"
          style={inputError.error_1 ? { border: "1px solid red" } : {}}
        />

        {/* MongoDB Scheme Selection */}
        {data.dbType === DBConnType.MONGO && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Scheme:
            </label>
            <select
              name="dbScheme"
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="default">Select scheme</option>
              <option value="mongodb">mongodb</option>
              <option value="mongodb+srv">mongodb+srv</option>
            </select>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <InputTextField
            label="Host:"
            name="dbHost"
            value={data.dbHost}
            onChange={handleChange}
            placeholder="Enter host"
            style={inputError.error_2 ? { border: "1px solid red" } : {}}
          />
          <InputTextField
            label="Port:"
            name="dbPort"
            value={data.dbPort}
            onChange={handleChange}
            placeholder="Enter Port"
            style={inputError.error_3 ? { border: "1px solid red" } : {}}
          />
        </div>

        <InputTextField
          label="Database Name:"
          name="dbDatabase"
          value={data.dbDatabase}
          onChange={handleChange}
          placeholder="Enter Database"
          style={inputError.error_4 ? { border: "1px solid red" } : {}}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <InputTextField
            label="Database User:"
            name="dbUsername"
            value={data.dbUsername}
            onChange={handleChange}
            placeholder="Enter Database username"
          />
          <PasswordInputField
            label="Database Password:"
            name="dbPassword"
            value={data.dbPassword}
            onChange={handleChange}
            placeholder="Enter database password"
          />
        </div>

        {/* Advanced Options */}
        {showAdditional && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <Settings className="mr-2 h-5 w-5" />
              Advanced Options
            </h3>

            {/* SSH Configuration */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Use SSH:
              </label>
              <select
                name="dbUseSSH"
                value={data.dbUseSSH}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              >
                <option value={DBConnectionUseSSHType.NONE}>None</option>
                <option value={DBConnectionUseSSHType.PASSWORD}>
                  Password
                </option>
                <option value={DBConnectionUseSSHType.KEYFILE}>
                  Identity File
                </option>
                <option value={DBConnectionUseSSHType.PASSKEYFILE}>
                  Identity File with Password
                </option>
              </select>
            </div>

            {/* SSL Option for MongoDB */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="ssl-checkbox"
                  name="dbUseSSL"
                  type="checkbox"
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="ssl-checkbox"
                  className="font-medium text-gray-700"
                >
                  Enable SSL
                </label>
                <p className="text-gray-500">
                  If you are connecting to database which enforce/require SSL
                  connection. (Example: Azure CosmosDB)
                </p>
              </div>
            </div>

            {/* SSH Fields */}
            {data.dbUseSSH !== DBConnectionUseSSHType.NONE && (
              <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputTextField
                    label="SSH Host:"
                    name="dbSSHHost"
                    value={data.dbSSHHost}
                    onChange={handleChange}
                    placeholder="Enter SSH Host"
                  />
                  <InputTextField
                    label="SSH User:"
                    name="dbSSHUser"
                    value={data.dbSSHUser}
                    onChange={handleChange}
                    placeholder="Enter SSH User"
                  />
                </div>

                {(data.dbUseSSH === DBConnectionUseSSHType.PASSWORD ||
                  data.dbUseSSH === DBConnectionUseSSHType.PASSKEYFILE) && (
                  <PasswordInputField
                    label="SSH Password:"
                    name="dbSSHPassword"
                    value={data.dbSSHPassword}
                    onChange={handleChange}
                    placeholder="Enter SSH Password"
                  />
                )}

                {(data.dbUseSSH === DBConnectionUseSSHType.KEYFILE ||
                  data.dbUseSSH === DBConnectionUseSSHType.PASSKEYFILE) && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      SSH Identity File:
                    </label>
                    <textarea
                      name="dbSSHKeyFile"
                      value={data.dbSSHKeyFile}
                      onChange={handleChange}
                      placeholder="Paste the contents of SSH Identity File here"
                      rows={4}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {!adding && addingError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 select-all">
            <p className="text-sm text-red-600 select-all">{String(addingError)}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={() => setShowAdditional(!showAdditional)}
            className="inline-flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Advanced options {showAdditional ? "−" : "+"}
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={testDBConn}
              disabled={testing}
              className="inline-flex items-center"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              onClick={startAddingDB}
              disabled={adding}
              className="inline-flex items-center"
            >
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Database
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default NewDBPage;
