import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setInitialized } from '../../redux/slides/chat/chatSlide';
import { useGetMeQuery } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slides/auth/authSlide';
import { useNavigate } from 'react-router-dom';
import { selectChatSDK } from '../../redux/slides/chat/chatSlide';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatSDK = useSelector(selectChatSDK);
  const { data, isSuccess, isError, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setCredentials({ user: data.user }));

      // Synchronize Chat SDK authentication
      chatSDK
        .setAuth({
          code: data.user._id || data.user.id || '',
          name: data.user.name || 'User',
          avatar: data.user.avatar,
          email: data.user.email,
        })
        .then(() => {
          dispatch(setInitialized(true));
        })
        .catch((err) => {
          console.error('Chat SDK authentication failed:', err);
        });
    }
  }, [isSuccess, data, dispatch, chatSDK]);

  useEffect(() => {
    if (isError) {
      chatSDK.clearAuth();
      navigate('/login');
    }
  }, [isError, navigate, chatSDK]);

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
