import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import {
  fetchCart,
  clearCart,
  applyCoupon,
  clearError,
} from "../../redux/cartSlice";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const {
    products,
    status,
    error,
    totalAmount,
    shippingCharge,
    appliedCoupon,
    discount,
  } = useSelector((state) => state.cart);

  const { userInfo, token } = useSelector((state) => state.login);

  // Local state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check authentication and fetch cart
  useEffect(() => {
    if (!userInfo?.id || !token) {
      navigate("/signin", {
        state: { from: "/cart", message: "Please login to access your cart" },
      });
      return;
    }

    dispatch(fetchCart({ userId: userInfo.id, token }));
  }, [userInfo, token, navigate, dispatch]);

  // Clear error and success messages
  const handleClearError = () => {
    dispatch(clearError());
    setCouponError("");
    setSuccessMessage("");
  };

  // Handle cart reset
  const handleResetCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await dispatch(clearCart({ userId: userInfo.id, token })).unwrap();
        setSuccessMessage("Cart cleared successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        // Error is handled by cartSlice state
      }
    }
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponError("");
    try {
      await dispatch(
        applyCoupon({
          userId: userInfo.id,
          token,
          couponCode: couponCode.trim(),
        })
      ).unwrap();
      setSuccessMessage("Coupon applied successfully!");
      setCouponCode("");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setCouponError(error || "Invalid coupon code");
    }
  };

  // Handle cart refresh
  const handleUpdateCart = () => {
    dispatch(fetchCart({ userId: userInfo.id, token }));
  };

  // Calculate final total with discount
  const finalTotal = totalAmount - discount + shippingCharge;

  // Loading state
  if (status === "loading" && products.length === 0) {
    return (
      <div className="max-w-container mx-auto px-4">
        <Breadcrumbs title="Cart" />
        <div className="flex justify-center items-center py-20">
          <div className="flex items-center gap-2 text-lg">
            <svg
              className="w-6 h-6 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading cart...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Cart" />

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleClearError}
            className="font-bold text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={handleClearError}
            className="font-bold text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {products.length > 0 ? (
        <div className="pb-20">
          {/* Loading indicator for actions */}
          {status === "loading" && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </div>
          )}

          {/* Cart Header */}
          <div className="w-full h-20 bg-[#F5F7F7] text-primeColor hidden lgl:grid grid-cols-5 place-content-center px-6 text-lg font-titleFont font-semibold">
            <h2 className="col-span-2">Product</h2>
            <h2>Price</h2>
            <h2>Quantity</h2>
            <h2>Sub Total</h2>
          </div>

          {/* Cart Items */}
          <div className="mt-5 space-y-4">
            {products.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Reset Cart Button */}
          <button
            onClick={handleResetCart}
            disabled={status === "loading"}
            className="py-2 px-10 bg-red-500 text-white font-semibold uppercase mb-4 hover:bg-red-700 duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Reset Cart"
            )}
          </button>

          {/* Coupon and Update Section */}
          <div className="flex flex-col mdl:flex-row justify-between border py-4 px-4 items-center gap-4 mdl:gap-0 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-4">
                <input
                  className="w-44 mdl:w-52 h-10 px-4 border text-primeColor text-sm outline-none border-gray-300 rounded"
                  type="text"
                  placeholder="Coupon Number"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                  disabled={status === "loading"}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={status === "loading"}
                  className="px-4 py-2 text-sm mdl:text-base font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Coupon
                </button>
              </div>
              {couponError && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <span>{couponError}</span>
                  <button
                    onClick={() => setCouponError("")}
                    className="text-red-700 hover:text-red-900"
                  >
                    ×
                  </button>
                </p>
              )}
              {appliedCoupon && (
                <p className="text-sm text-green-600">
                  Coupon "{appliedCoupon}" applied! Saved ${discount.toFixed(2)}
                </p>
              )}
            </div>

            <button
              onClick={handleUpdateCart}
              disabled={status === "loading"}
              className="px-4 py-2 text-lg font-semibold bg-gray-100 text-primeColor rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Cart
            </button>
          </div>

          {/* Cart Totals */}
          <div className="max-w-7xl gap-4 flex justify-end mt-4">
            <div className="w-full sm:w-96 flex flex-col gap-4 bg-white rounded-lg p-4 shadow-sm">
              <h1 className="text-2xl font-semibold text-right">Cart Totals</h1>
              <div>
                <p className="flex items-center justify-between border-[1px] border-gray-300 border-b-0 py-2 text-lg px-4 font-medium">
                  Subtotal
                  <span className="font-semibold tracking-wide font-titleFont">
                    ${totalAmount.toFixed(2)}
                  </span>
                </p>
                {discount > 0 && (
                  <p className="flex items-center justify-between border-[1px] border-gray-300 border-b-0 py-2 text-lg px-4 font-medium text-green-600">
                    Discount
                    <span className="font-semibold tracking-wide font-titleFont">
                      -${discount.toFixed(2)}
                    </span>
                  </p>
                )}
                <p className="flex items-center justify-between border-[1px] border-gray-300 border-b-0 py-2 text-lg px-4 font-medium">
                  Shipping Charge
                  <span className="font-semibold tracking-wide font-titleFont">
                    ${shippingCharge.toFixed(2)}
                  </span>
                </p>
                <p className="flex items-center justify-between border-[1px] border-gray-300 py-2 text-lg px-4 font-medium">
                  Total
                  <span className="font-bold tracking-wide text-lg font-titleFont">
                    ${finalTotal.toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex justify-end">
                <Link to="/paymentgateway">
                  <button
                    className="w-full sm:w-52 h-10 bg-primeColor text-white font-semibold rounded hover:bg-black duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={status === "loading"}
                  >
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col mdl:flex-row justify-center items-center gap-4 pb-20"
        >
          <div>
            <img
              className="w-80 rounded-lg p-4 mx-auto"
              src={emptyCart}
              alt="emptyCart"
            />
          </div>
          <div className="max-w-[500px] p-4 py-8 bg-white flex gap-4 flex-col items-center rounded-md shadow-lg">
            <h1 className="font-titleFont text-xl font-bold uppercase">
              Your Cart feels lonely.
            </h1>
            <p className="text-sm text-center px-10 -mt-2">
              Your Shopping cart lives to serve. Give it purpose - fill it with
              books, electronics, videos, etc. and make it happy.
            </p>
            <Link to="/shop">
              <button className="bg-primeColor rounded-md cursor-pointer hover:bg-black active:bg-gray-900 px-8 py-2 font-titleFont font-semibold text-lg text-gray-200 hover:text-white duration-300">
                Continue Shopping
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;
