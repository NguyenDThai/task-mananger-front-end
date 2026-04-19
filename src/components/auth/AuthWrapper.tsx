import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slides/auth/authSlide';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setChatAuth } = useChat();
  const { data, isSuccess, isError, isLoading } = useGetMeQuery();
  const isInitializing = useRef(false);

  useEffect(() => {
    if (!isSuccess || isInitializing.current) return;

    const user = data?.user;

    if (user?._id && user?.name) {
      dispatch(setCredentials({ user }));
      setChatAuth(user);
      isInitializing.current = true;
    }
  }, [isSuccess, data, dispatch, setChatAuth]);

  useEffect(() => {
    if (isError) {
      navigate('/login');
    }
  }, [isError, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
