import { type FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Users } from "lucide-react";
import AddNewProjectMemberCard from "../../components/cards/projectmembercard/addprojectmembercard";
import ProjectMemberCard from "../../components/cards/projectmembercard/projectmembercard";
import Constants from "../../constants";
import type { Project, ProjectMember } from "../../data/models";
import apiService from "../../network/apiService";
import { useApp } from "../../hooks/useApp";

const ProjectMembersPage: FunctionComponent<{}> = () => {
  const { id } = useParams();

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  const { selectProjects } = useApp();
  const projects: Project[] = selectProjects;
  const project: Project | undefined = projects.find((x) => x.id === id);

  useEffect(() => {
    (async () => {
      const response = await apiService.getProjectMembers(String(id));
      if (response.success) {
        setProjectMembers(response.data);
      }
    })();
  }, [id]);

  const onDeleteMember = async (userId: string) => {
    const response = await apiService.deleteProjectMember(project!.id, userId);
    if (response.success) {
      setProjectMembers(projectMembers.filter((pm) => pm.user.id !== userId));
    }
  };

  if (!project) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Project not found
          </h1>
          <p className="mt-2 text-gray-600">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center">
        <Users className="mr-3 h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Showing Members in {project?.name}
          </h1>
          <p className="mt-1 text-gray-600">
            Manage project team members and their permissions
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="mb-8 space-y-4">
        {projectMembers.map((pm: ProjectMember) => (
          <ProjectMemberCard
            key={pm.id}
            member={pm}
            isAdmin={project?.currentMember?.role.name == Constants.ROLES.ADMIN}
            onDeleteMember={onDeleteMember}
          />
        ))}
      </div>

      {/* Add New Member */}
      {project && (
        <div className="border-t border-gray-200 pt-6">
          <AddNewProjectMemberCard
            project={project}
            onAdded={(newMember: ProjectMember) => {
              setProjectMembers([...projectMembers, newMember]);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectMembersPage;
