import { type SubmitEventHandler, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthorization } from "../ctx/AuthenticationContext";

interface LocationState {
  from: {
    pathname: string;
  };
};

const Login: React.FC = () => {

  const { login } = useAuthorization();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();


  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/home';

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ username, password });
      navigate(from, { replace: true });

    } catch (error) {
      setError("Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  );
};

export default Login;