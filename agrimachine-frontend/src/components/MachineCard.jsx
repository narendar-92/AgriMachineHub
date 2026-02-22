import { useState } from "react";
import { API_BASE } from "../config/api";

export default function MachineCard({ machine }) {
  const [showForm, setShowForm] = useState(false);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [village, setVillage] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const resetForm = () => {
    setFarmerName("");
    setFarmerPhone("");
    setVillage("");
    setBookingDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleBooking = async () => {
    if (!farmerName || !farmerPhone || !village || !bookingDate || !startTime || !endTime) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machine._id,
          farmerName,
          farmerPhone,
          village,
          bookingDate,
          startTime,
          endTime
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Booking failed");
        return;
      }

      setMessage("Booking submitted successfully.");
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
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title">{machine.name}</h5>
        <p className="mb-1"><b>Owner:</b> {machine.ownerName}</p>
        <p className="mb-1"><b>Phone:</b> {machine.phone}</p>
        <p className="mb-1"><b>Type:</b> {machine.type}</p>
        <p className="mb-1"><b>Price:</b> Rs {machine.pricePerHour}/hour</p>
        <p className="mb-3">
          <b>Location:</b> {machine?.location?.village}, {machine?.location?.district}, {machine?.location?.state}
        </p>

        {message ? (
          <p className={isError ? "text-danger" : "text-success"}>{message}</p>
        ) : null}

        {!showForm ? (
          <button className="btn btn-success w-100" onClick={() => setShowForm(true)}>
            Book Machine
          </button>
        ) : (
          <div className="border rounded p-3">
            <input
              className="form-control mt-2"
              placeholder="Your Name"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
            />

            <input
              className="form-control mt-2"
              placeholder="Phone Number"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
            />

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
