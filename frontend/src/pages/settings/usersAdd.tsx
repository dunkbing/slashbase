import { type FunctionComponent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Constants from "../../constants";
import type { User } from "../../data/models";
import apiService from "../../network/apiService";
import { useApp } from "../../hooks/useApp";

const AddNewUserPage: FunctionComponent<{}> = () => {
  const navigate = useNavigate();

  const { selectCurrentUser } = useApp();
  const currentUser: User = selectCurrentUser;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (currentUser && !currentUser.isRoot) {
      navigate(Constants.APP_PATHS.SETTINGS_ACCOUNT.path);
    }
  }, [currentUser]);

  const startAdding = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setAdding(true);
    const result = await apiService.addUsers(email, password);
    if (result.success) {
      navigate(Constants.APP_PATHS.SETTINGS_USERS.path);
      toast.success("User added successfully");
    } else {
      toast.error(result.error!);
    }
    setAdding(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center">
        <UserPlus className="mr-3 h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
          <p className="mt-1 text-gray-600">
            Create a new user account for the system
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email:
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
              }}
              placeholder="Enter email for new user"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password:
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
              placeholder="Enter password for new user"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={startAdding}
              disabled={adding || !email.trim() || !password.trim()}
              className="inline-flex items-center"
            >
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewUserPage;
