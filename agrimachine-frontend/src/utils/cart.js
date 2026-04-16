const CART_KEY = "cartMachineIds";

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const getCartMachineIds = () => {
  const raw = localStorage.getItem(CART_KEY);
  const ids = safeParse(raw || "[]", []);
  return Array.isArray(ids) ? ids.filter(Boolean).map(String) : [];
};

const setCartMachineIds = (ids) => {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("cartUpdated"));
};

export const isInCart = (machineId) => getCartMachineIds().includes(String(machineId));

export const addToCart = (machineId) => {
  const id = String(machineId);
  const current = getCartMachineIds();
  if (current.includes(id)) return;
  setCartMachineIds([...current, id]);
};

export const removeFromCart = (machineId) => {
  const id = String(machineId);
  const current = getCartMachineIds();
  setCartMachineIds(current.filter((x) => x !== id));
};

export const clearCart = () => setCartMachineIds([]);

