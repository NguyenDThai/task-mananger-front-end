/* eslint-disable @typescript-eslint/no-explicit-any */
import AuthForm from "../../components/auth/AuthForm";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/auth/authSlide";
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (data: any) => {
    dispatch(login(data));
    navigate("/"); // chuyển về home
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <AuthForm type="login" onSubmit={handleLogin} />
    </div>
  );
}

export default Login;
