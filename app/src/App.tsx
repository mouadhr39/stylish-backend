import { Navigate, Route, Routes} from "react-router-dom";
import Login from "./routes/Login";
import Home from "./routes/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./routes/Dashboard";
import { useAuthorization } from "./ctx/AuthenticationContext";

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthorization();
  if (isLoading) return <div>Loading...</div>;
  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
};

const App: React.FC = () => {
  return (
         <Routes>
           <Route path="/" element={<RootRedirect />} />
           <Route path="/login" element={<Login />} />
           <Route element={<ProtectedRoute />}>
             <Route path="/home" element={<Home />} />
             <Route path="/dashboard" element={<Dashboard />} />
           </Route>
         </Routes>
  );
}

export default App;