import React, { type FunctionComponent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import emptyStateDatabaseImg from '../../assets/images/empty-state-database.svg';
import DBConnCard from '../../components/cards/dbconncard/dbconncard';
import NewDBConnButton from '../../components/cards/dbconncard/newdbconnectionbutton';
import { Button } from '../../components/ui/button';
import ConfirmModal from '../../components/widgets/confirmModal';
import Constants from '../../constants';
import type { DBConnection, Project } from '../../data/models';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  deleteDBConnectionInProject,
  deleteProject,
  getDBConnectionsInProjects,
  selectDBConnectionsInProject,
  selectProjects,
} from '../../redux/projectsSlice';
import { Trash2, User } from 'lucide-react';

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
    return <h1>Project not found</h1>;
  }

  const onDeleteDB = async (dbConnId: string) => {
    if (project.currentMember?.role.name !== Constants.ROLES.ADMIN) {
      toast.error('you need to be admin of this project to delete the database');
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
    <React.Fragment>
      <h1>Showing Databases in {project?.name}</h1>
      {project && databases.length === 0 && (
        <div className='empty-state'>
          <img className='empty-state-image' src={emptyStateDatabaseImg} />
          <h2>No Database Connections</h2>
          <p>Add a new database connection and connect to the database</p>
          <hr />
        </div>
      )}
      {databases.map((db: DBConnection) => (
        <DBConnCard key={db.id} dbConn={db} onDeleteDB={onDeleteDB} />
      ))}
      {project && <NewDBConnButton project={project} />}
      &nbsp;&nbsp;
      {Constants.Build === 'server' && (
        <Link to={Constants.APP_PATHS.PROJECT_MEMBERS.path.replace('[id]', project.id)}>
          <Button>
            <User /> View Project Members
          </Button>
        </Link>
      )}
      &nbsp;&nbsp;
      <Button
        variant='destructive'
        className='is-danger'
        disabled={
          Constants.Build === 'desktop'
            ? false
            : project.currentMember?.role.name !== Constants.ROLES.ADMIN
        }
        onClick={() => {
          setIsDeleting(true);
        }}
      >
        <Trash2 /> Delete Project
      </Button>
      {isDeleting && (
        <ConfirmModal
          message={`Are you sure you want to delete  ${project.name}?`}
          onConfirm={onDeleteProject}
          onClose={() => {
            setIsDeleting(false);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default ProjectPage;
