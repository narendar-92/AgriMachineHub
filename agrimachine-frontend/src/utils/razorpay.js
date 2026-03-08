export const ensureRazorpayLoaded = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = ({ key, orderId, amount, currency, name, description }) =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }

    const razorpay = new window.Razorpay({
      key,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled"))
      }
    });

    razorpay.on("payment.failed", () => {
      reject(new Error("Payment failed"));
    });

    razorpay.open();
  });
