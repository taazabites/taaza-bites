/**
 * Razorpay Payment Gateway Integration
 * Handles both real Razorpay SDK handshakes and elegant sandbox simulations.
 * Note: Frontend payment callbacks are insecure. Final payment confirmation 
 * MUST be handled by the backend webhook (see server.ts RAZORPAY WEBHOOK HANDLER)
 * which validates the x-razorpay-signature and updates the database securely.
 */
export function initiateRazorpayPayment(options: {
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId?: string;
  keyId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  modalCloseCallback?: () => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    // If real keys exist, load script and use real Razorpay
    if (options.keyId && options.keyId.startsWith("rzp_")) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key: options.keyId,
          amount: options.amount,
          currency: options.currency,
          name: options.name,
          description: options.description,
          order_id: options.orderId,
          prefill: options.prefill,
          handler: function (response: any) {
            options.handler(response);
            resolve();
          },
          modal: {
            ondismiss: function () {
              if (options.modalCloseCallback) {
                options.modalCloseCallback();
              }
              reject(new Error("Payment cancelled by user"));
            }
          }
        });
        rzp.open();
      };
      script.onerror = () => {
        reject(new Error("Razorpay SDK failed to load. Check your connection."));
      };
      document.body.appendChild(script);
    } else {
      reject(new Error("Razorpay is not configured. Payments cannot be completed on this device until checkout keys are available."));
    }
  });
}
