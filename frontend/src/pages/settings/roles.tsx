import { type FunctionComponent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Shield, Plus, Trash2, UserCheck, Loader2, X } from "lucide-react";
import ConfirmModal from "../../components/widgets/confirmModal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Constants from "../../constants";
import type { Role } from "../../data/models";
import apiService from "../../network/apiService";
import { useApp } from "../../hooks/useApp";

const ManageRolesPage: FunctionComponent<{}> = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isDeletingRole, setIsDeletingRole] = useState<Role | undefined>(
    undefined,
  );
  const [showAddingRole, setShowAddingRole] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);

  const newRoleInputRef = useRef<HTMLInputElement>(null);

  const { selectCurrentUser } = useApp();
  const currentUser = selectCurrentUser;
  useEffect(() => {
    if (currentUser && !currentUser.isRoot) {
      navigate(Constants.APP_PATHS.SETTINGS_ACCOUNT.path);
    }
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      const result = await apiService.getRoles();
      setRoles(result.data);
    })();
  }, []);

  const deleteRole = async () => {
    const result = await apiService.deleteRole(isDeletingRole!.id);
    if (result.success)
      setRoles(roles.filter((role) => role.id !== isDeletingRole!.id));
    else toast.error(result.error!);
    setIsDeletingRole(undefined);
  };

  const addRole = async () => {
    if (newRoleInputRef.current!.value == "") {
      return;
    }
    setAdding(true);
    const result = await apiService.addRole(newRoleInputRef.current!.value);
    if (result.success) {
      setRoles(roles.concat(result.data));
      toast.success("Role added successfully");
    } else {
      toast.error(result.error!);
    }
    setAdding(false);
    setShowAddingRole(false);
  };

  const updateRolePermission = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const roleId = e.target.dataset.roleid!;
    const perName = e.target.dataset.name!;
    const result = await apiService.updateRolePermission(
      roleId,
      perName,
      e.target.checked,
    );
    if (result.success) {
      const newRoles = [...roles];
      const roleIndex = roles.findIndex((role) => role.id === roleId)!;
      const role = roles[roleIndex];
      const rp: number | undefined = role.permissions?.findIndex(
        (rp) => rp.name === perName,
      );
      if (rp === undefined)
        role.permissions = [result.data, ...(role.permissions ?? [])];
      else role.permissions![rp] = result.data;
      newRoles[roleIndex] = role;
      setRoles(newRoles);
      toast.success("Successfully updated role permission");
    } else toast.error(result.error!);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="mr-3 h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Roles</h1>
            <p className="mt-1 text-gray-600">
              Create and manage user roles and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      {roles.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="border-r border-gray-200 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    rowSpan={2}
                  >
                    Roles
                  </th>
                  <th
                    className="border-r border-gray-200 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                    colSpan={1}
                  >
                    Permissions
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                    rowSpan={2}
                  >
                    Actions
                  </th>
                </tr>
                <tr>
                  <th className="border-r border-gray-200 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Read-only
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="border-r border-gray-200 px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      <div className="flex items-center">
                        <UserCheck className="mr-2 h-4 w-4 text-gray-400" />
                        {role.name}
                      </div>
                    </td>
                    <td className="border-r border-gray-200 px-6 py-4 text-center whitespace-nowrap">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          data-roleid={role.id}
                          data-name={Constants.ROLES_PERMISSIONS.READ_ONLY}
                          checked={
                            role.permissions
                              ? role.permissions.find(
                                  (rp) =>
                                    rp.name ===
                                    Constants.ROLES_PERMISSIONS.READ_ONLY,
                                )?.value
                              : false
                          }
                          onChange={updateRolePermission}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={role.name === Constants.ROLES.ADMIN}
                        onClick={() => {
                          setIsDeletingRole(role);
                        }}
                        className="inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Role Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {showAddingRole ? (
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <Plus className="mr-2 h-5 w-5" />
              Add New Role
            </h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role Name:
              </label>
              <Input
                ref={newRoleInputRef}
                type="text"
                placeholder="Enter name for new role"
                className="max-w-md"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={addRole}
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
                    Add Role
                  </>
                )}
              </Button>
              {!adding && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddingRole(false);
                  }}
                  className="inline-flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Add New Role
            </h3>
            <p className="mb-4 text-gray-600">
              Create a new role to assign to users
            </p>
            <Button
              onClick={() => {
                setShowAddingRole(true);
              }}
              className="inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Role
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeletingRole && (
        <ConfirmModal
          message={`Delete Role ${isDeletingRole.name}?`}
          onConfirm={deleteRole}
          onClose={() => {
            setIsDeletingRole(undefined);
          }}
        />
      )}
    </div>
  );
};

export default ManageRolesPage;
