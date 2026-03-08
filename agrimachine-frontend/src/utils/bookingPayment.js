import { API_BASE } from "../config/api";
import { ensureRazorpayLoaded, openRazorpayCheckout } from "./razorpay";

export const payOnlineBooking = async ({ bookingId, token }) => {
  const orderRes = await fetch(`${API_BASE}/api/book/${bookingId}/payment/order`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const orderData = await orderRes.json().catch(() => ({}));
  if (!orderRes.ok) {
    throw new Error(orderData.message || "Failed to start payment");
  }

  const sdkLoaded = await ensureRazorpayLoaded();
  if (!sdkLoaded) {
    throw new Error("Failed to load Razorpay checkout");
  }

  const { keyId, orderId, amount, currency } = orderData.data || {};
  const paymentResponse = await openRazorpayCheckout({
    key: keyId,
    orderId,
    amount,
    currency,
    name: "AgriMachineHub",
    description: "Machine booking payment"
  });

  const verifyRes = await fetch(`${API_BASE}/api/book/${bookingId}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(paymentResponse)
  });
  const verifyData = await verifyRes.json().catch(() => ({}));
  if (!verifyRes.ok) {
    throw new Error(verifyData.message || "Payment verification failed");
  }

  return verifyData;
};
