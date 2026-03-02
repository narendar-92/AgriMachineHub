import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function OwnerRegister() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/owner/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      navigate("/owner-login");
    } catch {
      setError(`Registration failed. Unable to reach API at ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "520px" }}>
      <h2>Owner Registration</h2>
      <p className="text-muted">Create account to add your machines and manage bookings.</p>
      {error && <p className="text-danger">{error}</p>}

      <input
        className="form-control mt-2"
        placeholder="Owner Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="form-control mt-2"
        placeholder="Phone Number"
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

      <button className="btn btn-success mt-3 w-100" onClick={register} disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </button>

      <p className="mt-3 mb-0">
        Already owner? <Link to="/owner-login">Login</Link>
      </p>
    </div>
  );
}
