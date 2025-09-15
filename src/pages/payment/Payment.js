import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { placeOrder, fetchOrderById } from "../../redux/orderSlice";
import { initiatePayment } from "../../redux/paymentSlice";
import { clearCart } from "../../redux/cartSlice";

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, token } = useSelector((state) => state.login);
  const cart = useSelector((state) => state.cart);
  const { products, totalAmount, shippingCharge, discount, appliedCoupon } =
    cart;
  const {
    currentOrder,
    status: orderStatus,
    error: orderError,
  } = useSelector((state) => state.orders);
  const { status: paymentStatus, error: paymentError } = useSelector(
    (state) => state.payment
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!userInfo?.id || !token) {
      navigate("/signin", {
        state: {
          from: "/paymentgateway",
          message: "Please login to proceed with payment",
        },
      });
    }
  }, [userInfo, token, navigate]);

  // Place order on mount
  useEffect(() => {
    if (
      userInfo?.id &&
      token &&
      products.length > 0 &&
      orderStatus === "idle"
    ) {
      dispatch(placeOrder({ userId: userInfo.id, token, cart }));
    } else if (products.length === 0) {
      navigate("/cart", {
        state: { message: "Your cart is empty. Please add items to proceed." },
      });
    }
  }, [dispatch, userInfo, token, products, orderStatus, cart, navigate]);

  // PayHere event handlers
  useEffect(() => {
    if (window.payhere) {
      window.payhere.onCompleted = (orderId) => {
        dispatch(clearCart({ userId: userInfo.id, token }));
        navigate(`/payment/success?orderId=${orderId}`);
      };
      window.payhere.onDismissed = () => {
        navigate(`/payment/cancel?orderId=${currentOrder?.id || ""}`);
      };
      window.payhere.onError = (errorMsg) => {
        navigate(
          `/payment/error?error=${encodeURIComponent(
            errorMsg || "Payment failed"
          )}`
        );
      };
    }
  }, [dispatch, navigate, userInfo, currentOrder]);

  // Handle errors from Redux
  useEffect(() => {
    if (orderError || paymentError) {
      const errorMessage = orderError || paymentError;
      navigate("/payment/error", {
        state: {
          error:
            errorMessage.includes("403") || errorMessage.includes("Forbidden")
              ? "You are not authorized to perform this action. Please log in again."
              : errorMessage || "An error occurred. Please try again.",
        },
      });
    }
  }, [orderError, paymentError, navigate]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+94\d{9}$/.test(formData.phone))
      errors.phone = "Invalid phone number (e.g., +94771234567)";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.country) errors.country = "Country is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!currentOrder) {
      navigate("/payment/error", {
        state: { error: "No order found. Please try again." },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData = await dispatch(
        initiatePayment({
          orderId: currentOrder.id,
          userId: userInfo.id,
          customerDetails: { ...formData },
          token,
        })
      ).unwrap();

      const payment = {
        sandbox: paymentData.sandbox,
        merchant_id: paymentData.merchantId,
        return_url: paymentData.returnUrl,
        cancel_url: paymentData.cancelUrl,
        notify_url: paymentData.notifyUrl,
        order_id: paymentData.orderId,
        items: paymentData.items,
        amount: paymentData.amount.toString(),
        currency: paymentData.currency,
        hash: paymentData.hash,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        delivery_address: formData.address,
        delivery_city: formData.city,
        delivery_country: formData.country,
        custom_1: userInfo.id,
        custom_2: "",
      };

      if (window.payhere) {
        window.payhere.startPayment(payment);
      } else {
        throw new Error("PayHere library not loaded");
      }
    } catch (err) {
      navigate("/payment/error", {
        state: {
          error: err.message || "Failed to initiate payment. Please try again.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/cart");
  };

  // Calculate total
  const finalTotal = totalAmount - discount + shippingCharge;

  if (orderStatus === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
        <Breadcrumbs title="Payment Gateway" />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-base text-gray-600">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
        <Breadcrumbs title="Payment Gateway" />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-base text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate("/cart")}
            className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
      <Breadcrumbs title="Payment Gateway" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Order Summary */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-black border-b-2 border-black pb-2 mb-4">
            Order Summary
          </h2>
          <div className="mb-4">
            <p className="text-base text-gray-700">
              <span className="font-medium">Order ID:</span> #{currentOrder.id}
            </p>
            <p className="text-base text-gray-700">
              <span className="font-medium">Status:</span> {currentOrder.status}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black mb-3">Items</h3>
            {products.map((item) => (
              <div
                key={item.cartItemId || item._id}
                className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
              >
                <span className="text-base font-medium text-black flex-1">
                  {item.name}
                </span>
                <span className="text-sm text-gray-600 mx-4">
                  x{item.quantity} @ ${item.price.toFixed(2)}
                </span>
                <span className="text-base font-semibold text-black">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="flex justify-between text-base text-gray-700 mb-2">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </p>
            {discount > 0 && (
              <p className="flex justify-between text-base text-black font-medium mb-2">
                <span>
                  Discount {appliedCoupon ? `(${appliedCoupon})` : ""}
                </span>
                <span>-${discount.toFixed(2)}</span>
              </p>
            )}
            <p className="flex justify-between text-base text-gray-700 mb-2">
              <span>Shipping</span>
              <span>${shippingCharge.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-lg font-bold text-black">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-black border-b-2 border-black pb-2 mb-4">
            Payment Details
          </h2>
          <form onSubmit={handlePayment} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="firstName"
                  className="text-sm font-semibold text-black mb-1"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                    formErrors.firstName ? "border-red-500" : "border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isSubmitting}
                />
                {formErrors.firstName && (
                  <span className="text-xs text-red-500 mt-1">
                    {formErrors.firstName}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="lastName"
                  className="text-sm font-semibold text-black mb-1"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                    formErrors.lastName ? "border-red-500" : "border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isSubmitting}
                />
                {formErrors.lastName && (
                  <span className="text-xs text-red-500 mt-1">
                    {formErrors.lastName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-black mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <span className="text-xs text-red-500 mt-1">
                  {formErrors.email}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="phone"
                className="text-sm font-semibold text-black mb-1"
              >
                Phone Number * (+94xxxxxxxxx)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                  formErrors.phone ? "border-red-500" : "border-gray-300"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="+94771234567"
                disabled={isSubmitting}
              />
              {formErrors.phone && (
                <span className="text-xs text-red-500 mt-1">
                  {formErrors.phone}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="address"
                className="text-sm font-semibold text-black mb-1"
              >
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                  formErrors.address ? "border-red-500" : "border-gray-300"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                rows="3"
                disabled={isSubmitting}
              />
              {formErrors.address && (
                <span className="text-xs text-red-500 mt-1">
                  {formErrors.address}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="city"
                  className="text-sm font-semibold text-black mb-1"
                >
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                    formErrors.city ? "border-red-500" : "border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isSubmitting}
                />
                {formErrors.city && (
                  <span className="text-xs text-red-500 mt-1">
                    {formErrors.city}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="country"
                  className="text-sm font-semibold text-black mb-1"
                >
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`p-3 border rounded-lg text-sm text-black bg-white focus:outline-none focus:border-black ${
                    formErrors.country ? "border-red-500" : "border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isSubmitting}
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className={`flex-1 px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {isSubmitting
                  ? "Processing Payment..."
                  : `Pay $${finalTotal.toFixed(2)}`}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-6 py-3 bg-white text-black text-base font-semibold rounded-lg border border-black hover:bg-gray-100 hover:-translate-y-0.5 transition-all ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
          <div className="mt-4 pt-3 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              🔒 Secure payment powered by PayHere
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
