import { type FunctionComponent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Trash2, User, Database } from "lucide-react";
import emptyStateDatabaseImg from "../../assets/images/empty-state-database.svg";
import DBConnCard from "../../components/cards/dbconncard/dbconncard";
import NewDBConnButton from "../../components/cards/dbconncard/newdbconnectionbutton";
import { Button } from "../../components/ui/button";
import ConfirmModal from "../../components/widgets/confirmModal";
import Constants from "../../constants";
import type { DBConnection, Project } from "../../data/models";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  deleteDBConnectionInProject,
  deleteProject,
  getDBConnectionsInProjects,
  selectDBConnectionsInProject,
  selectProjects,
} from "../../redux/projectsSlice";

const ProjectPage: FunctionComponent<{}> = () => {
  const { id } = useParams();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);

  const databases = useAppSelector(selectDBConnectionsInProject);
  const projects: Project[] = useAppSelector(selectProjects);
  const project: Project | undefined = projects.find((x) => x.id === id);

  useEffect(() => {
    dispatch(getDBConnectionsInProjects({ projectId: String(id) }));
  }, [dispatch, id]);

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

  const onDeleteDB = async (dbConnId: string) => {
    if (project.currentMember?.role.name !== Constants.ROLES.ADMIN) {
      toast.error(
        "you need to be admin of this project to delete the database",
      );
      return;
    }
    dispatch(deleteDBConnectionInProject({ dbConnId }));
    setIsDeleting(false);
  };

  const onDeleteProject = async () => {
    await dispatch(deleteProject({ projectId: project.id }));
    navigate(Constants.APP_PATHS.HOME.path);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Showing Databases in {project?.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage database connections for this project
          </p>
        </div>
      </div>

      {/* Empty State */}
      {project && databases.length === 0 && (
        <div className="py-12 text-center">
          <img
            className="mx-auto mb-6 h-32 w-32 opacity-50"
            src={emptyStateDatabaseImg}
            alt="No databases"
          />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            No Database Connections
          </h2>
          <p className="mb-6 text-gray-600">
            Add a new database connection and connect to the database
          </p>
          <div className="mx-auto w-full max-w-md border-t border-gray-200 pt-6" />
        </div>
      )}

      {/* Database Cards Grid */}
      {databases.length > 0 && (
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {databases.map((db: DBConnection) => (
            <DBConnCard key={db.id} dbConn={db} onDeleteDB={onDeleteDB} />
          ))}
        </div>
      )}

      {/* New DB Connection Button */}
      {project && (
        <div className="mb-8">
          <NewDBConnButton project={project} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 border-t border-gray-200 pt-6">
        {Constants.Build === "server" && (
          <Link
            to={Constants.APP_PATHS.PROJECT_MEMBERS.path.replace(
              "[id]",
              project.id,
            )}
          >
            <Button variant="outline" className="inline-flex items-center">
              <User className="mr-2 h-4 w-4" />
              View Project Members
            </Button>
          </Link>
        )}

        <Button
          variant="destructive"
          disabled={
            Constants.Build === "desktop"
              ? false
              : project.currentMember?.role.name !== Constants.ROLES.ADMIN
          }
          onClick={() => {
            setIsDeleting(true);
          }}
          className="inline-flex items-center"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Project
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <ConfirmModal
          message={`Are you sure you want to delete ${project.name}?`}
          onConfirm={onDeleteProject}
          onClose={() => {
            setIsDeleting(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectPage;
