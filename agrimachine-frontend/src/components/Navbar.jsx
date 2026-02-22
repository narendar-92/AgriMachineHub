import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("ownerToken");

  const navLinkClass = (path) =>
    `nav-link ${location.pathname === path ? "active text-warning" : "text-white"}`;

  const logout = () => {
    localStorage.removeItem("ownerToken");
    navigate("/owner-login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          AgriMachineHub
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={navLinkClass("/machines")} to="/machines">
                Find Machines
              </Link>
            </li>
            <li className="nav-item">
              <Link className={navLinkClass("/my-bookings")} to="/my-bookings">
                My Bookings
              </Link>
            </li>

            {token ? (
              <>
                <li className="nav-item">
                  <Link className={navLinkClass("/owner")} to="/owner">
                    Owner Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass("/owner-machines")} to="/owner-machines">
                    Manage Machines
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <button type="button" className="btn btn-sm btn-light mt-1" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={navLinkClass("/owner-login")} to="/owner-login">
                    Owner Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass("/owner-register")} to="/owner-register">
                    Owner Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
