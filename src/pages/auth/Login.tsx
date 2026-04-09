/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthForm } from '../../components';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slides/auth/authSlide';
import { useLoginMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [loginApi] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    try {
      const res = await loginApi(data).unwrap();

      dispatch(setCredentials(res.user));
      toast.success(res.message || 'Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);

      toast.error(error?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <AuthForm type="login" onSubmit={handleLogin} />
    </div>
  );
}

export default Login;
