import api from "../utils/axiosConfig";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createOrder = async (amount, registrationId, tournamentId) => {
  const response = await api.post("/payments/create-order", {
    amount,
    registrationId,
    tournamentId,
  });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post("/payments/verify-payment", paymentData);
  return response.data;
};

export const getRazorpayKey = async () => {
  const response = await api.get("/payments/get-key");
  return response.data;
};