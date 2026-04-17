import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slides/auth/authSlide';
import { useNavigate } from 'react-router-dom';
import { chat } from '../../services/chatService';
import { setCurrentUser } from '../../redux/slides/chat/chatSlide';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isSuccess, isError, isLoading } = useGetMeQuery();

  useEffect(() => {
    const user = data?.user || {};

    const setAuthForChat = async () => {
      try {
        if (user._id && user.name) {
          const userData = {
            code: user._id,
            name: user.name,
            avatar: user.avatar,
            email: user.email,
          };
          const currentUserData = await chat.setAuth(userData);
          dispatch(setCurrentUser(currentUserData));
        }
      } catch (error) {
        console.error('Failed to set auth for chat:', error);
      }
    };

    if (isSuccess && user && user._id && user.name) {
      dispatch(setCredentials({ user: user }));
      setAuthForChat();
    }
  }, [isSuccess, data, dispatch]);

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
