import { useEffect, useState } from "react";
import MachineCard from "../components/MachineCard";
import { API_BASE } from "../config/api";

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMachines = async (queryParams = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/${queryParams ? `machines/filter?${queryParams}` : "machines"}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load machines");
        setMachines([]);
        return;
      }
      setMachines(data.data || []);
    } catch {
      setError("Failed to load machines");
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (district.trim()) params.append("district", district.trim());
    if (type.trim()) params.append("type", type.trim());
    await fetchMachines(params.toString());
  };

  return (
    <div className="container mt-4">
      <h2>Available Machines</h2>

      <div className="card p-3 mt-3">
        <h5>Search Machines</h5>

        <div className="row">
          <div className="col-md-4">
            <label htmlFor="district">District</label>
            <input
              id="district"
              type="text"
              className="form-control"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Nashik"
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="type">Machine Type</label>
            <input
              id="type"
              type="text"
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Tractor / Harvester"
            />
          </div>

          <div className="col-md-4 d-flex align-items-end gap-2 mt-3 mt-md-0">
            <button className="btn btn-success w-100" onClick={handleSearch}>
              Search
            </button>
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setDistrict("");
                setType("");
                fetchMachines();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="mt-3">Loading machines...</p>}
      {error && <p className="text-danger mt-3">{error}</p>}

      <div className="row">
        {!loading && !error && machines.length === 0 ? (
          <h4 className="mt-3">No machines found</h4>
        ) : (
          machines.map((machine) => (
            <div className="col-md-6 col-lg-4 mt-3" key={machine._id}>
              <MachineCard machine={machine} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
