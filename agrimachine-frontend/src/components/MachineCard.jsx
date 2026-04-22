import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../config/api";
import { payOnlineBooking } from "../utils/bookingPayment";
import { addToCart, isInCart, removeFromCart } from "../utils/cart";

export default function MachineCard({ machine }) {
  const [showForm, setShowForm] = useState(false);
  const [village, setVillage] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CashAfterWork");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [cartVersion, setCartVersion] = useState(0);

  const inCart = isInCart(machine?._id) && cartVersion >= 0;

  const resetForm = () => {
    setVillage("");
    setBookingDate("");
    setStartTime("");
    setEndTime("");
    setPaymentMethod("CashAfterWork");
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setIsError(true);
      setMessage("Please login as user to book this machine.");
      return;
    }

    if (!village || !bookingDate || !startTime || !endTime) {
      setIsError(true);
      setMessage("Please fill all booking fields.");
      return;
    }

    try {
      setLoading(true);
      setIsError(false);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          machineId: machine._id,
          village,
          bookingDate,
          startTime,
          endTime,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Booking failed");
        return;
      }

      if (paymentMethod === "OnlineBeforeWork") {
        try {
          await payOnlineBooking({ bookingId: data?.data?._id, token });
          setIsError(false);
          setMessage("Booking submitted and payment completed successfully.");
        } catch (paymentError) {
          setIsError(true);
          setMessage(
            `${paymentError.message}. Booking was created. You can complete payment from My Bookings.`
          );
        }
      } else {
        setMessage("Booking submitted successfully.");
      }

      setShowForm(false);
      resetForm();
    } catch {
      setIsError(true);
      setMessage("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card soft-shadow hover-lift h-100 border-0">
      {machine?.images?.[0] ? (
        <img
          src={machine.images[0]}
          alt={machine.name}
          className="card-img-top"
          style={{ height: 180, objectFit: "cover" }}
        />
      ) : null}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold text-primary-dark mb-3">{machine.name}</h5>
        
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge badge-machine">{machine.type}</span>
          <span className="badge bg-light text-dark border">⭐ {machine.ownerName}</span>
        </div>

        <div className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>
          <div className="d-flex mb-1"><i className="bi bi-telephone-fill me-2 text-success"></i> {machine.phone}</div>
          <div className="d-flex mb-1"><i className="bi bi-geo-alt-fill me-2 text-success"></i> {machine?.location?.village}, {machine?.location?.district}</div>
        </div>

        <h4 className="text-success fw-bold mb-4 mt-auto">Rs {machine.pricePerHour}<span className="fs-6 text-muted fw-normal">/hour</span></h4>

        <div className="d-flex gap-2 mb-3 flex-wrap">
          {machine?.ownerId ? (
            <Link className="btn btn-outline-success btn-sm" to={`/owners/${machine.ownerId}`}>
              View Owner Profile
            </Link>
          ) : null}

          <button
            type="button"
            className={`btn btn-sm ${inCart ? "btn-outline-danger" : "btn-outline-primary"}`}
            onClick={() => {
              if (!machine?._id) return;
              if (isInCart(machine._id)) {
                removeFromCart(machine._id);
              } else {
                addToCart(machine._id);
              }
              setCartVersion((x) => x + 1);
            }}
          >
            {inCart ? "Remove from Cart" : "Add to Cart"}
          </button>
        </div>

        {message ? (
          <p className={isError ? "text-danger" : "text-success"}>{message}</p>
        ) : null}

        {!showForm ? (
          <button
            className="btn btn-success w-100"
            onClick={() => {
              if (!localStorage.getItem("userToken")) {
                setIsError(true);
                setMessage("Please login as user to book this machine.");
                return;
              }
              setIsError(false);
              setMessage("");
              setShowForm(true);
            }}
          >
            Book Machine
          </button>
        ) : (
          <div className="border rounded p-3">
            <input
              className="form-control mt-2"
              placeholder="Village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />

            <input
              className="form-control mt-2"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />

            <input
              className="form-control mt-2"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <input
              className="form-control mt-2"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <label className="form-label mt-3 mb-1"><b>Payment Option</b></label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CashAfterWork">Cash on completion (after work)</option>
              <option value="OnlineBeforeWork">Online before work</option>
            </select>

            <button className="btn btn-primary mt-3 w-100" onClick={handleBooking} disabled={loading}>
              {loading ? "Submitting..." : "Submit Booking"}
            </button>

            <button className="btn btn-outline-danger mt-2 w-100" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
