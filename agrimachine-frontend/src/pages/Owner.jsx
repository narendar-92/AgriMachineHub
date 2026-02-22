import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";

const statusBadge = (status) => {
  if (status === "Approved") return "success";
  if (status === "Rejected" || status === "Cancelled") return "danger";
  if (status === "Completed") return "secondary";
  return "warning";
};

export default function Owner() {
  const token = localStorage.getItem("ownerToken");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("ownerToken");
        }
        setError(data.message || "Failed to load bookings");
        setBookings([]);
        return;
      }

      setBookings(data.data || []);
    } catch {
      setError("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === "Pending").length, [bookings]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/book/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }
      await fetchBookings();
    } catch {
      alert("Failed to update status");
    }
  };

  const completeBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/book/complete/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to complete booking");
        return;
      }
      await fetchBookings();
    } catch {
      alert("Failed to complete booking");
    }
  };

  const deleteBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/book/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete booking");
        return;
      }
      await fetchBookings();
    } catch {
      alert("Failed to delete booking");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Owner Dashboard</h2>
        <span className="badge text-bg-warning">Pending: {pendingCount}</span>
      </div>

      {loading && <p className="mt-3">Loading bookings...</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
      {!loading && !error && bookings.length === 0 && <h4 className="mt-3">No booking requests yet</h4>}

      {bookings.map((b) => (
        <div className="card p-3 mt-3" key={b._id}>
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="mb-2">
              Machine: <span className="text-primary">{b.machineId?.name}</span>
            </h5>
            <span className={`badge text-bg-${statusBadge(b.status)}`}>{b.status}</span>
          </div>

          <p className="mb-1"><b>Farmer:</b> {b.farmerName}</p>
          <p className="mb-1"><b>Phone:</b> {b.farmerPhone}</p>
          <p className="mb-1"><b>Village:</b> {b.village}</p>
          <p className="mb-1"><b>Date:</b> {b.bookingDate}</p>
          <p className="mb-3"><b>Time:</b> {b.startTime} to {b.endTime}</p>

          <div className="d-flex gap-2 flex-wrap">
            {b.status === "Pending" ? (
              <>
                <button className="btn btn-success" onClick={() => updateStatus(b._id, "Approved")}>
                  Approve
                </button>
                <button className="btn btn-danger" onClick={() => updateStatus(b._id, "Rejected")}>
                  Reject
                </button>
              </>
            ) : null}

            {b.status === "Approved" ? (
              <button className="btn btn-outline-primary" onClick={() => completeBooking(b._id)}>
                Mark Completed
              </button>
            ) : null}

            {["Rejected", "Cancelled", "Completed"].includes(b.status) ? (
              <button className="btn btn-outline-dark" onClick={() => deleteBooking(b._id)}>
                Delete
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
