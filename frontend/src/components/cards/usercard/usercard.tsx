import type { User } from "../../../data/models";
import ProfileImage from "../../user/profileimage";

type UserCardPropType = {
  user: User;
};

const UserCard = ({ user }: UserCardPropType) => {
  return (
    <div className="my-4 max-w-[600px] rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex-shrink-0">
            <ProfileImage imageUrl={user.profileImageUrl} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900">
              {user.name ?? user.email}
            </div>
            {user.name && (
              <div className="mt-1 text-sm text-gray-600">{user.email}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
