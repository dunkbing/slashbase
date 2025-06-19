import { type FunctionComponent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import UserCard from "../../components/cards/usercard/usercard";
import { Button } from "../../components/ui/button";
import Constants from "../../constants";
import type { User } from "../../data/models";
import apiService from "../../network/apiService";
import { useApp } from "../../hooks/useApp";

const UsersPage: FunctionComponent<{}> = () => {
  const { selectCurrentUser } = useApp();
  const currentUser: User = selectCurrentUser;

  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [usersNext, setUsersNext] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isRoot) {
        fetchUsers();
      } else {
        navigate(Constants.APP_PATHS.HOME.path);
      }
    }
  }, [currentUser, usersNext]);

  const fetchUsers = async () => {
    if (usersNext === -1) {
      return;
    }
    const result = await apiService.getUsers(usersNext);
    if (result.success) {
      if (usersNext === 0) {
        setUsers(result.data.list);
      } else {
        setUsers([...users, ...result.data.list]);
      }
      setUsersNext(result.data.next);
    } else {
      toast.error(result.error!);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <UsersIcon className="mr-3 h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="mt-1 text-gray-600">
              View and manage all users in the system
            </p>
          </div>
        </div>

        <Link to={Constants.APP_PATHS.SETTINGS_ADD_USER.path}>
          <Button className="inline-flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <InfiniteScroll
          dataLength={users.length}
          next={fetchUsers}
          hasMore={usersNext !== -1}
          loader={
            <div className="flex justify-center py-4">
              <p className="text-gray-500">Loading...</p>
            </div>
          }
          scrollableTarget="mainContainer"
          className="divide-y divide-gray-200"
        >
          {users.map((user: User) => (
            <div key={user.id} className="p-4">
              <UserCard user={user} />
            </div>
          ))}
        </InfiniteScroll>

        {users.length === 0 && usersNext === -1 && (
          <div className="py-12 text-center">
            <UsersIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No users found
            </h3>
            <p className="text-gray-600">
              Start by adding your first user to the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
