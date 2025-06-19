import React, { type FunctionComponent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Constants from '../constants';
import { logoutUser } from '../redux/currentUserSlice';
import { useAppDispatch } from '../redux/hooks';

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
    <React.Fragment>
      <h1>Logging out...</h1>
    </React.Fragment>
  );
};

export default Logout;
