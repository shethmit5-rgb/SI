import React, { useState } from "react";
import {
  loadRazorpayScript,
  createOrder,
  verifyPayment,
  getRazorpayKey,
} from "../services/paymentService";
import "../static/PaymentModal.css";

export default function PaymentModal({ amount, registrationId, tournamentId, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      // Get Razorpay key
      const { key } = await getRazorpayKey();

      // Create order
      const { order, transactionId } = await createOrder(
        amount,
        registrationId,
        tournamentId
      );

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "ArenaSync",
        description: `Tournament Registration Fee - ₹${amount}`,
        order_id: order.id,
        handler: async (response) => {
          // Verify payment
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            transactionId: transactionId,
          });

          if (verification.success) {
            alert("Payment successful!");
            onSuccess();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h3>Complete Payment</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="payment-modal-body">
          <div className="amount-details">
            <p>Registration Fee:</p>
            <h2>₹{amount}</h2>
          </div>
          <button 
            className="pay-now-btn" 
            onClick={handlePayment} 
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹${amount}`}
          </button>
          <p className="secure-note">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}