// Payment Service for Nabha Healthcare Pharmacy
class PaymentService {
  constructor() {
    // Use your actual Razorpay test keys
    this.razorpayKey = "rzp_test_5KDLZcQOeZLk8K";
    this.razorpaySecret = "iup6OxBjjs22NfyIV2vN4x8p";
    this.monthlyPlanId = "plan_Qq8H89m2adcMl6";
    this.yearlyPlanId = "plan_Qq8Hl09aOS9uAg";
    this.webhookSecret = "69f8825c-ae86-4a76-89d5-501a621e772e";
    this.serverEndpoint = "http://localhost:5001";
    this.isRazorpayLoaded = false;
  }

  // Load Razorpay script dynamically
  loadRazorpay() {
    return new Promise((resolve, reject) => {
      if (this.isRazorpayLoaded || window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        this.isRazorpayLoaded = true;
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay SDK"));
      };
      document.body.appendChild(script);
    });
  }

  // Process online payment (simplified version without order creation)
  async processOnlinePayment(orderData) {
    try {
      await this.loadRazorpay();

      const options = {
        key: this.razorpayKey,
        amount: Math.round(orderData.amount * 100), // Convert to paise
        currency: "INR",
        name: "Nabha Healthcare",
        description: `Medicine Purchase - Order #${orderData.orderId}`,
        image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        handler: function (response) {
          // Payment successful
          orderData.onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: orderData.orderId,
            signature: "mock_signature_" + Date.now(),
          });
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.email,
          contact: orderData.phone,
        },
        notes: {
          address: orderData.address,
          city: orderData.city,
          pincode: orderData.pincode,
          order_id: orderData.orderId,
        },
        theme: {
          color: "#1f2937",
        },
        modal: {
          ondismiss: function () {
            orderData.onFailure("Payment cancelled by user");
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        orderData.onFailure(response.error.description);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment processing error:", error);
      orderData.onFailure("Payment processing failed: " + error.message);
    }
  }

  // Create order (simplified mock implementation)
  async createOrder(amount, currency = "INR") {
    try {
      // Generate a mock order ID for test mode
      const mockOrderId =
        "order_" + Date.now() + Math.random().toString(36).substr(2, 9);

      return {
        success: true,
        orderId: mockOrderId,
        amount: amount,
        currency: currency,
      };
    } catch (error) {
      console.error("Order creation error:", error);
      return {
        success: false,
        error: "Failed to create order",
      };
    }
  }

  // Verify payment (mock implementation for test mode)
  async verifyPayment(paymentData) {
    try {
      // In test mode, we'll assume payment is always verified
      // In production, this should verify the signature on your backend

      return {
        success: true,
        verified: true,
        transactionId: paymentData.paymentId,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        verified: false,
        error: "Payment verification failed",
      };
    }
  }

  // UPI payment link generator
  generateUPILink(amount, customerName, orderId) {
    const upiId = "nabhahealthcare@paytm"; // Replace with your UPI ID
    const transactionNote = `Medicine Order ${orderId}`;

    return `upi://pay?pa=${upiId}&pn=Nabha Healthcare&am=${amount}&cu=INR&tn=${encodeURIComponent(
      transactionNote
    )}`;
  }

  // Format amount for display
  formatAmount(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Generate payment receipt
  generateReceipt(orderData, paymentData) {
    return {
      receiptId: "RCP_" + Date.now(),
      orderId: orderData.orderId,
      paymentId: paymentData.paymentId,
      amount: orderData.amount,
      paymentMethod: orderData.paymentMethod,
      customerName: orderData.customerName,
      date: new Date().toISOString(),
      status: "completed",
    };
  }

  // Test connection to Razorpay
  async testConnection() {
    try {
      await this.loadRazorpay();
      console.log("✅ Razorpay SDK loaded successfully");
      console.log("🔑 Using API Key:", this.razorpayKey);
      return true;
    } catch (error) {
      console.error("❌ Failed to load Razorpay SDK:", error);
      return false;
    }
  }
}

export default new PaymentService();
