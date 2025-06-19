import { type FunctionComponent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Constants from "../constants";
import { logoutUser } from "../redux/currentUserSlice";
import { useAppDispatch } from "../redux/hooks";

const Logout: FunctionComponent<{}> = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(logoutUser()).unwrap();
      navigate(Constants.APP_PATHS.HOME.path);
    })();
  }, []);

  return (
    <div className="flex min-h-96 items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Logging out...</h1>
        <p className="mt-2 text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
};

export default Logout;
