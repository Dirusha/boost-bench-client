import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center bg-white p-8 rounded-lg border border-gray-200 max-w-md w-full">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-black mb-2">
          Payment Successful!
        </h1>
        <p className="text-base text-gray-600 mb-2">
          Your order has been successfully processed.
        </p>
        {orderId && (
          <p className="text-base text-gray-600 mb-4">
            <span className="font-medium">Order ID:</span> #{orderId}
          </p>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-white text-black text-base font-semibold rounded-lg border border-black hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center bg-white p-8 rounded-lg border border-gray-200 max-w-md w-full">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-semibold text-black mb-2">
          Payment Cancelled
        </h1>
        <p className="text-base text-gray-600 mb-2">
          You have cancelled the payment process.
        </p>
        {orderId && (
          <p className="text-base text-gray-600 mb-4">
            <span className="font-medium">Order ID:</span> #{orderId}
          </p>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate(`/paymentgateway`)}
            className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 bg-white text-black text-base font-semibold rounded-lg border border-black hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center bg-white p-8 rounded-lg border border-gray-200 max-w-md w-full">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-semibold text-black mb-2">
          Payment Failed
        </h1>
        <p className="text-base text-gray-600 mb-2">
          There was an error processing your payment.
        </p>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-4">
            {error}
          </p>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-white text-black text-base font-semibold rounded-lg border border-black hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
