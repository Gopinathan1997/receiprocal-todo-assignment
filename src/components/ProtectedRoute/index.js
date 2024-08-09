import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  if (Cookies.get("jwt_token") === undefined) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
