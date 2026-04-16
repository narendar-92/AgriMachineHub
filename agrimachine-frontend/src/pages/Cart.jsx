import { useEffect, useMemo, useState } from "react";
import MachineCard from "../components/MachineCard";
import { API_BASE } from "../config/api";
import { clearCart, getCartMachineIds, removeFromCart } from "../utils/cart";

export default function Cart() {
  const [machineIds, setMachineIds] = useState(() => getCartMachineIds());
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onUpdate = () => setMachineIds(getCartMachineIds());
    window.addEventListener("cartUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cartUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const loadMachines = async (ids) => {
    if (!ids.length) {
      setMachines([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${API_BASE}/api/machines/${id}`);
          const data = await res.json();
          if (!res.ok) return null;
          return data.data || null;
        })
      );
      setMachines(results.filter(Boolean));
    } catch {
      setError("Failed to load cart machines");
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines(machineIds);
  }, [machineIds.join("|")]);

  const count = machineIds.length;

  const missingCount = useMemo(() => Math.max(0, count - machines.length), [count, machines.length]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="mb-0">Cart</h2>
        {count ? (
          <button className="btn btn-outline-danger" onClick={() => clearCart()}>
            Clear Cart
          </button>
        ) : null}
      </div>

      {!count ? <p className="mt-3">Your cart is empty.</p> : null}
      {loading ? <p className="mt-3">Loading cart machines...</p> : null}
      {error ? <p className="text-danger mt-3">{error}</p> : null}
      {missingCount ? (
        <p className="text-muted mt-3">
          Some machines could not be loaded (they may have been deleted).
        </p>
      ) : null}

      <div className="row">
        {machines.map((machine) => (
          <div className="col-md-6 col-lg-4 mt-3" key={machine._id}>
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger position-absolute"
                style={{ right: 10, top: 10, zIndex: 2 }}
                onClick={() => removeFromCart(machine._id)}
              >
                Remove
              </button>
              <MachineCard machine={machine} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

