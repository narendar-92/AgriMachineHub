import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { payOnlineBooking } from "../utils/bookingPayment";

const statusColor = (status) => {
  if (status === "Approved") return "success";
  if (status === "Rejected" || status === "Cancelled") return "danger";
  if (status === "Completed") return "secondary";
  return "primary";
};

export default function MyBookings() {
  const token = localStorage.getItem("userToken");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/user-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("userToken");
        }
        setError(data.message || "Failed to fetch bookings");
        setBookings([]);
      } else {
        setBookings(data.data || []);
      }
    } catch {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/book/cancel/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
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

  const handleOnlinePayment = async (bookingId) => {
    try {
      await payOnlineBooking({ bookingId, token });
      await fetchBookings();
      alert("Payment completed successfully");
    } catch (error) {
      alert(error.message || "Payment failed");
    }
  };

  return (
    <div className="container mt-4">
      <h2>My Bookings</h2>
      {loading && <p className="mt-3">Loading bookings...</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
      {!loading && bookings.length === 0 && !error && (
        <h4 className="mt-4 text-danger">No bookings found</h4>
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
            <b>Payment Method:</b>{" "}
            {b.paymentMethod === "OnlineBeforeWork" ? "Online before work" : "Cash on completion"}
          </p>
          <p>
            <b>Payment Status:</b>{" "}
            <span className={`badge text-bg-${b.paymentStatus === "Paid" ? "success" : "warning"}`}>
              {b.paymentStatus || "Pending"}
            </span>
          </p>

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

          {b.paymentMethod === "OnlineBeforeWork" &&
            b.paymentStatus !== "Paid" &&
            !["Cancelled", "Rejected", "Completed"].includes(b.status) && (
              <button
                className="btn btn-primary mt-2 ms-2"
                onClick={() => handleOnlinePayment(b._id)}
              >
                Pay Now
              </button>
            )}
        </div>
      ))}
    </div>
  );
}
