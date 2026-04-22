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

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

export default function OwnerMachines() {
  const token = localStorage.getItem("ownerToken");
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);

  // Editing state
  const [editingMachine, setEditingMachine] = useState(null);

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

  const onSelectImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setImages([]);
      return;
    }

    if (files.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      e.target.value = "";
      setImages([]);
      return;
    }

    const tooLarge = files.find((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge) {
      setError("Each image must be 2MB or smaller.");
      e.target.value = "";
      setImages([]);
      return;
    }

    try {
      setProcessingImages(true);
      setError("");
      const urls = await Promise.all(files.map(fileToDataUrl));
      setImages(urls);
    } catch {
      setError("Failed to read selected images.");
      setImages([]);
    } finally {
      setProcessingImages(false);
    }
  };

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
      setSubmitting(true);
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
          images,
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
      setImages([]);
      await fetchOwnerMachines();
    } catch {
      setError("Failed to add machine");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (m) => {
    setEditingMachine({
      _id: m._id,
      name: m.name,
      ownerName: m.ownerName,
      phone: m.phone,
      type: m.type,
      pricePerHour: m.pricePerHour,
      village: m.location?.village || "",
      district: m.location?.district || "",
      state: m.location?.state || "",
      available: m.available
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateMachine = async () => {
    if (!editingMachine) return;
    try {
      setSubmitting(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/machines/${editingMachine._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingMachine.name,
          ownerName: editingMachine.ownerName,
          phone: editingMachine.phone,
          type: editingMachine.type,
          pricePerHour: Number(editingMachine.pricePerHour),
          available: editingMachine.available,
          location: {
            village: editingMachine.village,
            district: editingMachine.district,
            state: editingMachine.state
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update machine");
        return;
      }

      setEditingMachine(null);
      await fetchOwnerMachines();
    } catch {
      setError("Failed to update machine");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMachine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;
    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/machines/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete machine");
        return;
      }
      if (editingMachine && editingMachine._id === id) {
        setEditingMachine(null);
      }
      await fetchOwnerMachines();
    } catch {
      setError("Failed to delete machine");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Manage Machines</h2>
      {error && <p className="text-danger">{error}</p>}

      {/* Editing Machine Form */}
      {editingMachine ? (
        <div className="card p-3 mt-3 border-warning shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-warning mb-0">Edit Machine</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingMachine(null)}>Cancel</button>
          </div>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label mb-1 text-muted small">Machine Name</label>
              <input
                className="form-control"
                value={editingMachine.name}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label mb-1 text-muted small">Owner Name</label>
              <input
                className="form-control"
                value={editingMachine.ownerName}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, ownerName: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label mb-1 text-muted small">Owner Phone</label>
              <input
                className="form-control"
                value={editingMachine.phone}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label mb-1 text-muted small">Type</label>
              <input
                className="form-control"
                value={editingMachine.type}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, type: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1 text-muted small">Price Per Hour</label>
              <input
                className="form-control"
                type="number"
                value={editingMachine.pricePerHour}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, pricePerHour: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1 text-muted small">Village</label>
              <input
                className="form-control"
                value={editingMachine.village}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, village: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1 text-muted small">District</label>
              <input
                className="form-control"
                value={editingMachine.district}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, district: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label mb-1 text-muted small">State</label>
              <input
                className="form-control"
                value={editingMachine.state}
                onChange={(e) => setEditingMachine((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="availabilitySwitch"
                  checked={editingMachine.available}
                  onChange={(e) => setEditingMachine((prev) => ({ ...prev, available: e.target.checked }))}
                />
                <label className="form-check-label ms-2 fw-semibold" htmlFor="availabilitySwitch">
                  {editingMachine.available ? "Currently Available" : "Currently Unavailable"}
                </label>
              </div>
            </div>
            <div className="col-12 mt-3">
              <button
                className="btn btn-warning w-100"
                onClick={updateMachine}
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-3 mt-3 shadow-sm">
          <h5 className="mb-3">Add New Machine</h5>
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
            <div className="col-12">
              <label className="form-label mb-1"><b>Machine Photos</b> (optional, up to {MAX_IMAGES})</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                multiple
                onChange={onSelectImages}
                disabled={submitting || processingImages}
              />
              {images.length ? (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Machine ${idx + 1}`}
                      style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="col-12 mt-3">
              <button
                className="btn btn-success w-100"
                onClick={addMachine}
                disabled={submitting || processingImages}
              >
                {submitting ? "Adding..." : processingImages ? "Processing images..." : "Add Machine"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h4 className="mt-5 mb-3 border-bottom pb-2">My Machines</h4>
      {machines.length === 0 ? <p className="text-muted">No machines added yet</p> : null}
      <div className="row">
        {machines.map((m) => (
          <div className="col-md-6 col-lg-4 mt-3" key={m._id}>
            <div className="card p-3 h-100 shadow-sm border-0 bg-white" style={{ borderRadius: '12px' }}>
              {m.images?.[0] ? (
                <img
                  src={m.images[0]}
                  alt={m.name}
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: '8px' }}
                  className="mb-3"
                />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center mb-3" style={{ width: "100%", height: 180, borderRadius: '8px' }}>
                  <span className="text-muted"><i className="bi bi-image fs-1"></i></span>
                </div>
              )}
              <h5 className="fw-bold mb-2">{m.name}</h5>
              <div className="mb-3 text-muted small">
                <div className="d-flex justify-content-between mb-1">
                  <span><i className="bi bi-tag-fill me-1"></i> {m.type}</span>
                  <span className="fw-semibold text-success">Rs {m.pricePerHour}/hr</span>
                </div>
                <div className="mb-1"><i className="bi bi-telephone-fill me-1"></i> {m.phone}</div>
                <div className="mb-2"><i className="bi bi-geo-alt-fill me-1"></i> {m.location?.village}, {m.location?.district}, {m.location?.state}</div>
                <div>
                  <span className={`badge bg-${m.available ? "success" : "secondary"} rounded-pill`}>
                    {m.available ? "Available" : "Booked"}
                  </span>
                </div>
              </div>
              <div className="mt-auto d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => handleEditClick(m)}>
                  <i className="bi bi-pencil-square me-1"></i> Edit
                </button>
                <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => deleteMachine(m._id)}>
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
