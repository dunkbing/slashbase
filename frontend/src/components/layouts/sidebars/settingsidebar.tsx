import {
  HelpCircle,
  Info,
  Settings,
  Shield,
  User as UserIcon,
  UserPlus,
  Users,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Constants from "../../../constants";
import type { User } from "../../../data/models";
import { selectCurrentUser } from "../../../redux/currentUserSlice";
import { useAppSelector } from "../../../redux/hooks";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";

type SettingSidebarPropType = {};

const SettingSidebar = (_: SettingSidebarPropType) => {
  const currentUser: User = useAppSelector(selectCurrentUser);
  const location = useLocation();

  return (
    <React.Fragment>
      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenu>
          {Constants.Build === "server" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith(
                  Constants.APP_PATHS.SETTINGS_ACCOUNT.path,
                )}
              >
                <Link to={Constants.APP_PATHS.SETTINGS_ACCOUNT.path}>
                  <UserIcon className="h-4 w-4" />
                  <span>Account</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname.startsWith(
                Constants.APP_PATHS.SETTINGS_GENERAL.path,
              )}
            >
              <Link to={Constants.APP_PATHS.SETTINGS_GENERAL.path}>
                <Settings className="h-4 w-4" />
                <span>General</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname.startsWith(
                Constants.APP_PATHS.SETTINGS_ADVANCED.path,
              )}
            >
              <Link to={Constants.APP_PATHS.SETTINGS_ADVANCED.path}>
                <Shield className="h-4 w-4" />
                <span>Advanced</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {Constants.Build === "server" && currentUser && currentUser.isRoot && (
        <SidebarGroup>
          <SidebarGroupLabel>Manage Team</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith(
                  Constants.APP_PATHS.SETTINGS_USERS.path,
                )}
              >
                <Link to={Constants.APP_PATHS.SETTINGS_USERS.path}>
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === Constants.APP_PATHS.SETTINGS_ROLES.path
                }
              >
                <Link to={Constants.APP_PATHS.SETTINGS_ROLES.path}>
                  <UserPlus className="h-4 w-4" />
                  <span>Manage Roles</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      <SidebarGroup>
        <SidebarGroupLabel>Info</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={
                location.pathname === Constants.APP_PATHS.SETTINGS_ABOUT.path
              }
            >
              <Link to={Constants.APP_PATHS.SETTINGS_ABOUT.path}>
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={
                location.pathname === Constants.APP_PATHS.SETTINGS_SUPPORT.path
              }
            >
              <Link to={Constants.APP_PATHS.SETTINGS_SUPPORT.path}>
                <HelpCircle className="h-4 w-4" />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </React.Fragment>
  );
};

export default SettingSidebar;
