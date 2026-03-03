import { Link } from "react-router-dom";

export default function User() {
  return (
    <div className="container mt-4">
      <h2>User Dashboard</h2>
      <p className="text-muted">Manage your machine bookings from one place.</p>

      <div className="card p-3 mt-3">
        <h5>Quick Actions</h5>
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Link to="/machines" className="btn btn-success">
            Find Machines
          </Link>
          <Link to="/my-bookings" className="btn btn-outline-success">
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
