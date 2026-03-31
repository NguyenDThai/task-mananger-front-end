/* eslint-disable @typescript-eslint/no-explicit-any */
import AuthForm from "../../components/auth/AuthForm";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (data: any) => {
    console.log("Register:", data);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <AuthForm type="register" onSubmit={handleRegister} />
    </div>
  );
}
