import { useState } from "react";
import { API_BASE } from "../config/api";

const statusColor = (status) => {
  if (status === "Approved") return "success";
  if (status === "Rejected" || status === "Cancelled") return "danger";
  if (status === "Completed") return "secondary";
  return "primary";
};

export default function MyBookings() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkBookings = async () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/user-bookings?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to fetch bookings");
        setBookings([]);
      } else {
        setBookings(data.data || []);
      }
      setSearched(true);
    } catch {
      setError("Failed to fetch bookings");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/book/cancel/${id}`, {
        method: "PUT"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to cancel booking");
        return;
      }

      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b)));
    } catch {
      alert("Failed to cancel booking");
    }
  };

  return (
    <div className="container mt-4">
      <h2>My Bookings</h2>

      <div className="card p-3 mt-3">
        <label htmlFor="phone"><b>Enter Phone Number</b></label>
        <input
          id="phone"
          type="text"
          className="form-control"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="btn btn-success mt-3" onClick={checkBookings} disabled={loading}>
          {loading ? "Checking..." : "Check Status"}
        </button>
      </div>

      {error && <p className="text-danger mt-3">{error}</p>}
      {searched && !loading && bookings.length === 0 && !error && (
        <h4 className="mt-4 text-danger">No bookings found for this number</h4>
      )}

      {bookings.map((b) => (
        <div className="card p-3 mt-3" key={b._id}>
          <h5>Machine: {b.machineId?.name}</h5>
          <p><b>Owner Phone:</b> {b.machineId?.phone}</p>
          <p><b>Village:</b> {b.village}</p>
          <p><b>Date:</b> {b.bookingDate}</p>
          <p><b>Time:</b> {b.startTime} to {b.endTime}</p>
          <p><b>Price:</b> Rs {b.machineId?.pricePerHour} / hour</p>

          <p>
            <b>Status:</b>{" "}
            <span className={`badge text-bg-${statusColor(b.status)}`}>{b.status}</span>
          </p>

          <p><b>Requested On:</b> {new Date(b.createdAt).toLocaleDateString()}</p>

          {(b.status === "Pending" || b.status === "Approved") && (
            <button className="btn btn-danger mt-2" onClick={() => cancelBooking(b._id)}>
              Cancel Booking
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
