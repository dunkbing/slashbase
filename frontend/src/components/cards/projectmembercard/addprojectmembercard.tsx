import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { UserPlus, X } from "lucide-react";
import Constants from "../../../constants";
import type { Project, ProjectMember, Role, User } from "../../../data/models";
import apiService from "../../../network/apiService";
import type { AddProjectMemberPayload } from "../../../network/payloads";
import { useApp } from "../../../hooks/useApp";
import ProfileImage from "../../user/profileimage";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

type AddNewProjectMemberCardPropType = {
  project: Project;
  onAdded: (newMember: ProjectMember) => void;
};

const AddNewProjectMemberCard = ({
  project,
  onAdded,
}: AddNewProjectMemberCardPropType) => {
  const { selectCurrentUser } = useApp();
  const currentUser: User = selectCurrentUser;

  const [showing, setShowing] = useState(false);
  const searchTerm = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchOffset, setSearchOffset] = useState<number>(0);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<string>(Constants.ROLES.ADMIN);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  const selectRoleRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    (async () => {
      const result = await apiService.getRoles();
      setRoles(result.data);
    })();
  }, []);

  if (!currentUser || (currentUser && !currentUser.isRoot)) {
    return null;
  }

  const onSearch = async () => {
    if (searchTerm.current!.value === "") {
      if (searchResults.length !== 0) {
        setSearchResults([]);
        setSearchOffset(0);
      }
      return;
    }
    if (searching) return;
    fetchSearchUsers(0);
  };

  const fetchSearchUsers = async (offset: number) => {
    setSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (searchTerm.current!.value === "") {
      setSearching(false);
      return;
    }
    const results = await apiService.searchUsers(
      searchTerm.current!.value,
      offset,
    );
    if (results.success) {
      if (offset == 0) {
        setSearchResults(results.data.list);
      } else {
        setSearchResults([...searchResults, ...results.data.list]);
      }
      setSearchOffset(results.data.next);
      setSearching(false);
    }
  };

  const startAddingMember = async () => {
    if (adding) {
      return;
    }
    setAdding(true);
    const payload: AddProjectMemberPayload = {
      email: memberEmail,
      roleId: selectRoleRef.current!.value,
    };
    const response = await apiService.addNewProjectMember(project.id, payload);
    if (response.success) {
      onAdded(response.data);
    }
    clearAndExit();
  };

  const clearAndExit = () => {
    setAdding(false);
    setShowing(false);
    setMemberEmail("");
    setSearchResults([]);
    setSearchOffset(0);
    setMemberRole(Constants.ROLES.ADMIN);
  };

  return (
    <React.Fragment>
      {!showing && (
        <Button
          onClick={() => {
            setShowing(true);
          }}
          variant="outline"
          className="mb-4"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Project Member
        </Button>
      )}
      {showing && (
        <div className="my-4 max-w-[600px] rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4">
            {memberEmail == "" ? (
              <>
                <div className="mb-4 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search users by name or email"
                    ref={searchTerm}
                    onChange={onSearch}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAndExit}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <InfiniteScroll
                    dataLength={searchResults.length}
                    next={() => fetchSearchUsers(searchOffset)}
                    hasMore={searchOffset !== -1}
                    loader={
                      <p className="p-2 text-sm text-gray-500">Loading...</p>
                    }
                    height={215}
                    className="mt-6 max-h-[215px] overflow-x-hidden rounded-md border border-gray-200"
                  >
                    {searchResults.map((user: User) => (
                      <div
                        key={user.id}
                        className="flex cursor-pointer items-center gap-3 border-b border-gray-100 p-3 transition-colors last:border-b-0 hover:bg-gray-50"
                        onClick={() => {
                          setMemberEmail(user.email);
                        }}
                      >
                        <div className="h-10 w-10 flex-shrink-0">
                          <ProfileImage imageUrl={user.profileImageUrl} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900">
                            {user.name ?? user.email}
                          </div>
                          {user.name && (
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </InfiniteScroll>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="No user selected"
                  value={memberEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setMemberEmail(e.target.value);
                  }}
                  className="flex-1"
                />
                <select
                  ref={selectRoleRef}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <Button onClick={startAddingMember} disabled={adding}>
                  {adding ? "Adding..." : "Add"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAndExit}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default AddNewProjectMemberCard;
