import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthorization } from "../ctx/AuthenticationContext";

const ProtectedRoute: React.FC = () => {

  const { isAuthenticated, isLoading } = useAuthorization();
  const location = useLocation();
  
  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated, "isLoading =", isLoading, "location =", location);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;