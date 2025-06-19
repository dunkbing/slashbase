import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import Constants from "../../../constants";
import type { Project } from "../../../data/models";

type NewDBConnButtonPropType = {
  project: Project;
};

const NewDBConnButton = ({ project }: NewDBConnButtonPropType) => {
  return (
    <Link to={Constants.APP_PATHS.NEW_DB.path.replace("[id]", project.id)}>
      <Button>
        <CirclePlus />
        Add New DB Connection
      </Button>
    </Link>
  );
};

export default NewDBConnButton;
