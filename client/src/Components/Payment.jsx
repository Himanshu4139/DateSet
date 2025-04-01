import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Payment = () => {
  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="payment-container p-6 text-center rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Why You Should Pay to Instant Match and Chat
          </h2>
          <p className="text-gray-600 mb-6">
            Paying for instant match and chat gives you access to premium
            features that enhance your experience. You can connect faster, chat
            without limits, and enjoy exclusive benefits that make your
            interactions more meaningful and efficient.
          </p>
          <button
            className="mt-4 px-6 py-3 text-lg font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
            onClick={() => alert("Proceed to Payment")}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;
