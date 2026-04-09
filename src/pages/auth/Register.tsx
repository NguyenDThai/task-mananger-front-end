/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthForm } from '../../components';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';

export default function Register() {
  const [registerApi] = useRegisterMutation();
  const navigate = useNavigate();

  const handleRegister = async (data: any) => {
    try {
      const res = await registerApi(data).unwrap();
      toast.success(res.message || 'Đăng ký thành công!');
      navigate('/login');
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <AuthForm type="register" onSubmit={handleRegister} />
    </div>
  );
}
