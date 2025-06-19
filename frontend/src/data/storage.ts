import localforage from "localforage";
import Constants from "../constants";
import type { User } from "./models";

const slashbaseStore = (() => {
  if (Constants.Build === "server") {
    return localforage.createInstance({
      name: "SlashbaseStore",
    });
  }
  return undefined;
})();

const CURRENT_USER_KEY = "currentUser";

const CONFIG_IS_SHOWING_SIDEBAR = "configIsShowingSidebar";

const loginCurrentUser = async (currentUser: User): Promise<User> =>
  await slashbaseStore!.setItem(CURRENT_USER_KEY, currentUser);

const updateCurrentUser = async (currentUser: User): Promise<User> =>
  await slashbaseStore!.setItem(CURRENT_USER_KEY, currentUser);

const getCurrentUser = async (): Promise<User | null> =>
  await slashbaseStore!.getItem(CURRENT_USER_KEY);

const logoutUser = async (): Promise<void> => slashbaseStore!.clear();

const isShowingSidebar = async (): Promise<boolean> => {
  if (Constants.Build === "desktop") {
    return true;
  }
  const isShowing: boolean | null = await slashbaseStore!.getItem(
    CONFIG_IS_SHOWING_SIDEBAR,
  );
  if (isShowing == null) {
    return true;
  }
  return isShowing;
};

const setIsShowingSidebar = async (
  isShowingSidebar: boolean,
): Promise<boolean> => {
  if (Constants.Build === "desktop") {
    return true;
  }
  return await slashbaseStore!.setItem(
    CONFIG_IS_SHOWING_SIDEBAR,
    isShowingSidebar,
  );
};

export default {
  loginCurrentUser,
  updateCurrentUser,
  getCurrentUser,
  logoutUser,
  isShowingSidebar,
  setIsShowingSidebar,
};
