import axios from "axios";
import { type FunctionComponent, useEffect, useState } from "react";
import { RefreshCw, Undo2, Save, Loader2 } from "lucide-react";
import ProfileImage, {
  ProfileImageSize,
} from "../../components/user/profileimage";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import type { User } from "../../data/models";
import { useApp } from "../../hooks/useApp";

const AccountPage: FunctionComponent<{}> = () => {
  const { selectCurrentUser, editUser } = useApp();
  const currentUser: User = selectCurrentUser;

  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState(false);

  useEffect(() => {
    setEditableUser(currentUser);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Not logged in
          </h1>
          <p className="mt-2 text-gray-600">Check other settings.</p>
        </div>
      </div>
    );
  }

  const startSaving = async () => {
    setSaving(true);
    setSavingError(false);
    try {
      await editUser(editableUser!.name ?? "", editableUser!.profileImageUrl);
    } catch (e) {
      setSavingError(true);
    }
    setSaving(false);
  };

  const refreshImageUrl = async () => {
    const response = await axios.get(
      `https://picsum.photos/seed/${Date.now()}/200/200`,
    );
    const newImageURL = response.request.responseURL;
    setEditableUser({ ...editableUser!, profileImageUrl: newImageURL });
  };

  const revertImageUrl = async () => {
    setEditableUser({
      ...editableUser!,
      profileImageUrl: currentUser.profileImageUrl,
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Account</h1>

      {editableUser && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {/* Profile Image Section */}
          <div className="mb-6">
            <label className="mb-4 block text-sm font-medium text-gray-700">
              Profile Image:
            </label>
            <div className="flex items-center space-x-4">
              <ProfileImage
                imageUrl={editableUser.profileImageUrl}
                size={ProfileImageSize.MEDIUM}
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshImageUrl}
                  className="inline-flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={revertImageUrl}
                  className="inline-flex items-center"
                >
                  <Undo2 className="mr-2 h-4 w-4" />
                  Revert
                </Button>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email:
            </label>
            <Input
              type="email"
              value={editableUser.email}
              disabled={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEditableUser({ ...editableUser, email: e.target.value });
              }}
              placeholder="Enter your email"
              className="bg-gray-50"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Name Field */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name:
            </label>
            <Input
              type="text"
              value={editableUser.name ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEditableUser({ ...editableUser, name: e.target.value });
              }}
              placeholder="Enter your name"
            />
          </div>

          {/* Error Message */}
          {savingError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">
                There was some problem saving!
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={startSaving}
              disabled={saving}
              className="inline-flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
