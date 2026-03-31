import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home/Home";
import AuthWrapper from "../components/auth/AuthWrapper";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
