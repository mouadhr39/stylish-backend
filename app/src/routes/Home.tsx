import { useNavigate } from "react-router-dom";
import { useAuthorization } from "../ctx/AuthenticationContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthorization();

 
  return (
    <div className="container">
      <div className="card">
        <h1>Welcome Home 🎉</h1>

        <p>
          You have successfully logged in to the application.
          Hello, {user?.name}!
        </p>
        <button onClick={() => navigate("/dashboard")}>
          Goto Dashboard
        </button>
        <button onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;