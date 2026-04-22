import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartMachineIds } from "../utils/cart";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const ownerToken = localStorage.getItem("ownerToken");
  const userToken = localStorage.getItem("userToken");
  const [cartCount, setCartCount] = useState(() => getCartMachineIds().length);

  useEffect(() => {
    const onUpdate = () => setCartCount(getCartMachineIds().length);
    window.addEventListener("cartUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cartUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const navLinkClass = (path) =>
    `nav-link px-3 ${location.pathname === path ? "active fw-semibold text-success" : ""}`;

  const logoutOwner = () => {
    localStorage.removeItem("ownerToken");
    navigate("/owner-login");
  };

  const logoutUser = () => {
    localStorage.removeItem("userToken");
    navigate("/user-login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" style={{width: '40px', height: '40px'}}>
            <i className="bi bi-truck fs-5"></i>
          </span>
          AgriMachine<span className="text-success">Hub</span>
        </Link>
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-1 text-dark"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className={navLinkClass("/machines")} to="/machines">
                <i className="bi bi-search me-1"></i> Find Machines
              </Link>
            </li>
            <li className="nav-item">
              <Link className={navLinkClass("/cart")} to="/cart">
                <i className="bi bi-cart3 me-1"></i> Cart
                {cartCount > 0 && (
                  <span className="badge bg-success rounded-pill ms-2">{cartCount}</span>
                )}
              </Link>
            </li>
          </ul>

          <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center">
            {/* User Section */}
            {userToken ? (
              <div className="nav-item dropdown">
                <button
                  className="btn btn-light dropdown-toggle rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle text-success me-2 fs-5"></i>
                  Farmer Portal
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3" style={{ borderRadius: '12px', minWidth: '220px' }}>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center" to="/user">
                      <i className="bi bi-speedometer2 me-3 text-muted"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center" to="/my-bookings">
                      <i className="bi bi-calendar-check me-3 text-muted"></i> My Bookings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger d-flex align-items-center" onClick={logoutUser}>
                      <i className="bi bi-box-arrow-right me-3"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link className="btn btn-outline-success rounded-pill px-4 py-2 fw-semibold" to="/user-login">
                Farmer Login
              </Link>
            )}

            {/* Owner Section */}
            {ownerToken ? (
              <div className="nav-item dropdown">
                <button
                  className="btn btn-dark dropdown-toggle rounded-pill px-4 py-2 shadow-sm d-flex align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-briefcase-fill text-warning me-2 fs-5"></i>
                  Owner Portal
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3" style={{ borderRadius: '12px', minWidth: '220px' }}>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center" to="/owner">
                      <i className="bi bi-speedometer2 me-3 text-muted"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center" to="/owner-machines">
                      <i className="bi bi-tractor me-3 text-muted"></i> Manage Machines
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger d-flex align-items-center" onClick={logoutOwner}>
                      <i className="bi bi-box-arrow-right me-3"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link className="btn btn-success rounded-pill px-4 py-2 shadow-sm fw-semibold" to="/owner-login">
                Owner Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
