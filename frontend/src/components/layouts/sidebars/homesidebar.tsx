import { Database, Folder, FolderPlus, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../../constants';
import type { DBConnection, Project } from '../../../data/models';
import { selectAllDBConnections } from '../../../redux/allDBConnectionsSlice';
import { useAppSelector } from '../../../redux/hooks';
import { selectProjects } from '../../../redux/projectsSlice';
import CreateNewProjectModal from '../../home/createprojectmodal';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../../ui/sidebar';

type HomeSidebarPropType = {};

const HomeSidebar = (_: HomeSidebarPropType) => {
  const [isShowingCreateProject, setIsShowingCreateProject] = useState(false);

  const allProjects: Project[] = useAppSelector(selectProjects);
  const allDBConnections: DBConnection[] = useAppSelector(selectAllDBConnections);

  return (
    <React.Fragment>
      <SidebarGroup>
        <SidebarGroupLabel>Projects & Databases</SidebarGroupLabel>
        <SidebarMenu>
          {allProjects.map((project: Project) => {
            const projectConnections = allDBConnections.filter(
              (dbConn: DBConnection) => dbConn.projectId === project.id,
            );

            return (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link to={Constants.APP_PATHS.PROJECT.path.replace('[id]', project.id)}>
                    <Folder className='h-4 w-4' />
                    <span>{project.name}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {projectConnections.map((dbConn: DBConnection) => (
                    <SidebarMenuSubItem key={dbConn.id}>
                      <SidebarMenuSubButton asChild>
                        <Link to={Constants.APP_PATHS.DB.path.replace('[id]', dbConn.id)}>
                          <Database className='h-4 w-4' />
                          <span>{dbConn.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={Constants.APP_PATHS.NEW_DB.path.replace('[id]', project.id)}>
                        <Plus className='h-4 w-4' />
                        <span>Add DB</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setIsShowingCreateProject(true);
              }}
            >
              <FolderPlus className='h-4 w-4' />
              <span>Create new project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      {isShowingCreateProject && (
        <CreateNewProjectModal
          onClose={() => {
            setIsShowingCreateProject(false);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default HomeSidebar;
