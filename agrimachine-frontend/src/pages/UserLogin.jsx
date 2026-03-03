import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function UserLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!phone.trim() || !password) {
      setError("Phone and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("userToken", data.token);
      navigate("/user");
    } catch {
      setError(`Login failed. Unable to reach API at ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "520px" }}>
      <h2>User Login</h2>
      <p className="text-muted">Login to book machines and view your bookings.</p>
      {error && <p className="text-danger">{error}</p>}

      <input
        className="form-control mt-2"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="form-control mt-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-success mt-3 w-100" onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="mt-3 mb-0">
        New user? <Link to="/user-register">Create account</Link>
      </p>
    </div>
  );
}
