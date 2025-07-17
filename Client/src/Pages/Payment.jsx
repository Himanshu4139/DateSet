import React from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Payment = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL; // For Vite projects
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleClick1 = async () => {
    try {
      // Creating order in Razorpay
      const orderResponse = await axios.post(`${apiUrl}/api/payment/orderPayment`, { amount: 499 });
      const orderId = orderResponse.data.response.id;

      const options = {
        key: razorpayKey, // Your Razorpay key
        amount: 499 * 100, // Amount in paise
        currency: 'INR',
        name: 'DateSet',
        description: 'Test Transaction',
        image: 'https://example.com/your_logo',
        order_id: orderId,
        handler: async function (response) {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: 'Gaurav Kumar',
          email: 'gaurav.kumar@example.com',
          contact: '9000090000'
        },
        notes: {
          address: 'Razorpay Corporate Office'
        },
        theme: {
          color: '#3399cc'
        }
      };

      // Razorpay must be available on window after script loads
      if (window.Razorpay) {
        const rzp1 = new window.Razorpay(options);

        rzp1.on('payment.failed', (error) => {
          alert(`Payment failed: ${error.error.description}`);
        });

        // Open Razorpay modal
        rzp1.open();
      } else {
        alert("Razorpay SDK failed to load. Please refresh and try again.");
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
      const data = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      };

      const res = await axios.post(`${apiUrl}/api/payment/orderValidate`, data);
      if (res.data.success) {
        toast.success('Payment successful!');
        
        const subscribeRes = await axios.put(`${apiUrl}/api/user/subscribeUser`, { subscribtion: true }, { withCredentials: true });
        if (subscribeRes.data.success) {
          console.log(subscribeRes.data.message);
          
          toast.success('Subscription activated successfully!');
          navigate('/');
        }
        else {
          toast.error('Failed to activate subscription. Please try again.');
          console.error('Subscription activation failed:', subscribeRes.data.message);
        }
      } else {
        toast.error('Payment verification failed!');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Payment verification failed!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm">
        <Header />
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-center">
              <h1 className="text-3xl font-bold text-white">Premium Membership</h1>
              <p className="text-pink-100 mt-2">Unlock the full experience</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex justify-center mb-8">
                <div className="bg-pink-100 p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Why Upgrade to Premium?
              </h2>

              <ul className="space-y-4 mb-8">
                {                  [
                  "✨ Instant matching with compatible profiles",
                  "💬 Unlimited messaging with all connections",
                  "👀 See who viewed your profile",
                  "🎯 Priority placement in search results",
                  "🔒 Advanced privacy controls"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-pink-50 p-6 rounded-lg mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Monthly Plan</span>
                  <span className="text-lg font-bold text-pink-600">$9.99/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Yearly Plan (Save 20%)</span>
                  <span className="text-lg font-bold text-pink-600">$95.88/year</span>
                </div>
              </div>

              <button
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                onClick={handleClick1}
              >
                Upgrade Now - Start Your 7-Day Free Trial
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Cancel anytime. No credit card required for trial.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md">
        <Footer />
      </footer>
    </div>
  );
};

export default Payment;