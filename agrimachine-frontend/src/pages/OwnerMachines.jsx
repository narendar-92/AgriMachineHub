import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

const initialForm = {
  name: "",
  ownerName: "",
  phone: "",
  type: "",
  pricePerHour: "",
  village: "",
  district: "",
  state: ""
};

export default function OwnerMachines() {
  const token = localStorage.getItem("ownerToken");
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOwnerMachines = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/owner/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to fetch machines");
        setMachines([]);
        return;
      }
      setMachines(data.data || []);
    } catch {
      setError("Failed to fetch machines");
    }
  };

  useEffect(() => {
    fetchOwnerMachines();
  }, [token]);

  const addMachine = async () => {
    const required = [
      form.name,
      form.ownerName,
      form.phone,
      form.type,
      form.pricePerHour,
      form.district
    ];
    if (required.some((v) => !String(v).trim())) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/machines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          ownerName: form.ownerName.trim(),
          phone: form.phone.trim(),
          type: form.type.trim(),
          pricePerHour: Number(form.pricePerHour),
          location: {
            village: form.village.trim(),
            district: form.district.trim(),
            state: form.state.trim()
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to add machine");
        return;
      }

      setForm(initialForm);
      await fetchOwnerMachines();
    } catch {
      setError("Failed to add machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Manage Machines</h2>
      {error && <p className="text-danger">{error}</p>}

      <div className="card p-3 mt-3">
        <h5>Add New Machine</h5>

        <div className="row g-2">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Machine Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Owner Name"
              value={form.ownerName}
              onChange={(e) => setForm((prev) => ({ ...prev, ownerName: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Owner Phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Type (Tractor/Harvester)"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Price Per Hour"
              type="number"
              value={form.pricePerHour}
              onChange={(e) => setForm((prev) => ({ ...prev, pricePerHour: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Village"
              value={form.village}
              onChange={(e) => setForm((prev) => ({ ...prev, village: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="District"
              value={form.district}
              onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <button className="btn btn-success w-100" onClick={addMachine} disabled={loading}>
              {loading ? "Adding..." : "Add Machine"}
            </button>
          </div>
        </div>
      </div>

      <h4 className="mt-4">My Machines</h4>
      {machines.length === 0 ? <p>No machines added yet</p> : null}
      <div className="row">
        {machines.map((m) => (
          <div className="col-md-6 col-lg-4 mt-3" key={m._id}>
            <div className="card p-3 h-100">
              <h5>{m.name}</h5>
              <p className="mb-1"><b>Type:</b> {m.type}</p>
              <p className="mb-1"><b>Price:</b> Rs {m.pricePerHour}/hour</p>
              <p className="mb-1"><b>Phone:</b> {m.phone}</p>
              <p className="mb-1"><b>Location:</b> {m.location?.village}, {m.location?.district}, {m.location?.state}</p>
              <p className="mb-0">
                <b>Availability:</b>{" "}
                <span className={`badge text-bg-${m.available ? "success" : "secondary"}`}>
                  {m.available ? "Available" : "Booked"}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
