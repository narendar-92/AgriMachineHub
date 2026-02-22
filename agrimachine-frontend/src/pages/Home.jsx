import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-lg-7">
          <h1 className="display-5 fw-bold">Book Farm Machines Fast</h1>
          <p className="lead text-muted">
            Farmers can discover nearby tractors and harvesters, request bookings, and track status.
            Owners can accept or reject requests and manage machine availability in real time.
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/machines" className="btn btn-success btn-lg">
              Book a Machine
            </Link>
            <Link to="/owner-login" className="btn btn-outline-success btn-lg">
              Owner Dashboard
            </Link>
          </div>
        </div>
        <div className="col-lg-5 mt-4 mt-lg-0">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Workflow</h5>
              <ol className="mb-0">
                <li>Farmer searches machines by district/type.</li>
                <li>Farmer sends booking request.</li>
                <li>Owner approves/rejects request.</li>
                <li>Booking completes and machine becomes available again.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
