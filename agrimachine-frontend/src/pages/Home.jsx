import { Link } from "react-router-dom";
import heroImg from "../assets/hero_bg.png";

export default function Home() {
  return (
    <div className="container py-4">
      <div className="hero-section">
        <img src={heroImg} alt="Agricultural Field" className="hero-bg-img" />
        <div className="hero-overlay"></div>
        <div className="hero-content p-4 p-md-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-4 fw-bolder mb-3 text-white">Book Farm Machines Fast</h1>
              <p className="lead mb-4 text-white" style={{ opacity: 0.9 }}>
                Farmers can discover nearby tractors and harvesters, request bookings, and track status.
                Owners can accept or reject requests and manage machine availability in real time.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/machines" className="btn btn-success btn-lg hover-lift shadow-lg">
                  Book a Machine
                </Link>
                <Link to="/owner-login" className="btn btn-outline-light btn-lg hover-lift">
                  Owner Dashboard
                </Link>
              </div>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="glass-card p-4">
                <h4 className="mb-4 d-flex align-items-center gap-2">
                  <span className="badge bg-success rounded-pill">How it works</span>
                </h4>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, minWidth: 32 }}>1</div>
                    <p className="mb-0 fw-medium">Search machines by district or type</p>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, minWidth: 32 }}>2</div>
                    <p className="mb-0 fw-medium">Send a booking request</p>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, minWidth: 32 }}>3</div>
                    <p className="mb-0 fw-medium">Owner approves request</p>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, minWidth: 32 }}>4</div>
                    <p className="mb-0 fw-medium">Complete booking after work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
