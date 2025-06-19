import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Constants from "../../constants";
import { useApp } from "../../hooks/useApp";
import { Button } from "../ui/button";

type CreateNewProjectModalPropType = {
  onClose: () => void;
};

const CreateNewProjectModal = ({ onClose }: CreateNewProjectModalPropType) => {
  const navigate = useNavigate();
  const { createNewProject } = useApp();

  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const startCreatingProject = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const result = await createNewProject(projectName);
    if (result.success) {
      setLoading(false);
      setProjectName("");
      onClose();
      navigate(
        Constants.APP_PATHS.PROJECT.path.replace("[id]", result.project!.id),
      );
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content" style={{ width: "initial" }}>
        <div className="box">
          <div style={{ paddingBottom: 12 }}>
            <h2>Create new project</h2>
          </div>
          <div className="field">
            <div className="control is-expanded">
              <input
                className="input"
                type="text"
                placeholder="Enter Project Name"
                value={projectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setProjectName(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="buttons">
            <Button
              className="is-small is-primary"
              onClick={startCreatingProject}
            >
              {loading ? "Creating" : "Create"}
            </Button>
            <Button variant="ghost" className="is-small" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewProjectModal;
