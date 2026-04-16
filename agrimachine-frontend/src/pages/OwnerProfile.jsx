import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MachineCard from "../components/MachineCard";
import { API_BASE } from "../config/api";

const StarRow = ({ value }) => {
  const v = Number(value || 0);
  const full = Math.round(v);
  return (
    <span aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (i < full ? "★" : "☆")).join("")}
    </span>
  );
};

export default function OwnerProfile() {
  const { id } = useParams();
  const token = localStorage.getItem("userToken");

  const [owner, setOwner] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myRating, setMyRating] = useState(5);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingMsg, setRatingMsg] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      setRatingMsg("");

      const [ownerRes, machinesRes] = await Promise.all([
        fetch(`${API_BASE}/api/owners/${id}`),
        fetch(`${API_BASE}/api/owners/${id}/machines`)
      ]);

      const ownerJson = await ownerRes.json();
      const machinesJson = await machinesRes.json();

      if (!ownerRes.ok) throw new Error(ownerJson.message || "Failed to load owner");
      if (!machinesRes.ok) throw new Error(machinesJson.message || "Failed to load owner machines");

      setOwner(ownerJson.data || null);
      setMachines(machinesJson.data || []);
    } catch (e) {
      setError(e.message || "Failed to load owner profile");
      setOwner(null);
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const canRate = Boolean(token);

  const saveRating = async () => {
    if (!token) {
      setRatingMsg("Please login as user to rate this owner.");
      return;
    }
    try {
      setRatingSaving(true);
      setRatingMsg("");
      const res = await fetch(`${API_BASE}/api/owners/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value: Number(myRating) })
      });
      const data = await res.json();
      if (!res.ok) {
        setRatingMsg(data.message || "Failed to save rating");
        return;
      }
      setOwner((prev) =>
        prev ? { ...prev, ratingAvg: data?.data?.ratingAvg ?? prev.ratingAvg, ratingCount: data?.data?.ratingCount ?? prev.ratingCount } : prev
      );
      setRatingMsg("Rating saved.");
    } catch {
      setRatingMsg("Failed to save rating");
    } finally {
      setRatingSaving(false);
    }
  };

  const availableCount = useMemo(() => machines.filter((m) => m.available).length, [machines]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Owner Profile</h2>
          <Link to="/machines" className="text-decoration-none">
            ← Back to Machines
          </Link>
        </div>
      </div>

      {loading ? <p className="mt-3">Loading owner profile...</p> : null}
      {error ? <p className="text-danger mt-3">{error}</p> : null}

      {!loading && owner ? (
        <div className="card p-3 mt-3">
          <h4 className="mb-1">{owner.name}</h4>
          <p className="mb-1"><b>Phone:</b> {owner.phone}</p>
          <p className="mb-1">
            <b>Rating:</b> <StarRow value={owner.ratingAvg} />{" "}
            <span className="text-muted">({owner.ratingAvg || 0} / 5, {owner.ratingCount || 0} ratings)</span>
          </p>
          <p className="mb-0 text-muted">
            Machines: {machines.length} (Available: {availableCount})
          </p>

          <div className="mt-3">
            <h6 className="mb-2">Rate this owner</h6>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <select
                className="form-select"
                style={{ maxWidth: 200 }}
                value={myRating}
                onChange={(e) => setMyRating(Number(e.target.value))}
                disabled={!canRate || ratingSaving}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Bad</option>
              </select>
              <button className="btn btn-success" onClick={saveRating} disabled={!canRate || ratingSaving}>
                {ratingSaving ? "Saving..." : "Submit Rating"}
              </button>
              {!canRate ? (
                <span className="text-muted">
                  Login to rate.
                </span>
              ) : null}
            </div>
            {ratingMsg ? <p className={ratingMsg.includes("saved") ? "text-success mt-2 mb-0" : "text-danger mt-2 mb-0"}>{ratingMsg}</p> : null}
          </div>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <h4 className="mt-4">Owner Machines</h4>
          {machines.length === 0 ? <p>No machines found.</p> : null}
          <div className="row">
            {machines.map((machine) => (
              <div className="col-md-6 col-lg-4 mt-3" key={machine._id}>
                <MachineCard machine={machine} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

