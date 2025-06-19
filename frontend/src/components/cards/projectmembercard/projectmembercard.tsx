import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { MoreVertical, UserMinus } from "lucide-react";
import type { ProjectMember } from "../../../data/models";
import ProfileImage from "../../user/profileimage";
import { Button } from "../../ui/button";

type ProjectMemberCardPropType = {
  member: ProjectMember;
  isAdmin: boolean;
  onDeleteMember: (dbConnId: string) => void;
};

const ProjectMemberCard = ({
  member,
  isAdmin,
  onDeleteMember,
}: ProjectMemberCardPropType) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="my-4 max-w-[600px] rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex-shrink-0">
            <ProfileImage imageUrl={member.user.profileImageUrl} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900">
              {member.user.name ?? member.user.email}
            </div>
            {member.user.name && (
              <div className="mt-1 text-sm text-gray-600">
                {member.user.email}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {member.role.name}
            </span>
          </div>
          {isAdmin && (
            <div className="relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDropdown}
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showDropdown && (
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setShowDropdown(false);
                  }}
                >
                  <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-gray-200 bg-white shadow-lg">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onDeleteMember(member.user.id);
                        }}
                        className="flex w-full items-center px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <UserMinus className="mr-2 h-3 w-3" />
                        Remove Member
                      </button>
                    </div>
                  </div>
                </OutsideClickHandler>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectMemberCard;
