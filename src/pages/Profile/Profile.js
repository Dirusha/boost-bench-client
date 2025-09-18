import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { fetchUserOrders, clearOrderError } from "../../redux/orderSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, token } = useSelector((state) => state.login) || {};
  const { orders, status, error } = useSelector((state) => state.orders) || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("orderId");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (!userInfo?.id || !token) {
      navigate("/signin", {
        state: {
          from: "/profile",
          message: "Please log in to view your profile",
        },
      });
    } else {
      dispatch(fetchUserOrders({ userId: userInfo.id, token }));
    }
  }, [dispatch, userInfo, token, navigate]); // Removed status from dependencies

  // Filter orders based on selected filter type with exact ID matching, showing all if empty
  const filteredOrders = orders
    ? orders.filter((order) => {
        const items = order.items || [];
        if (filterType === "orderId" && searchTerm)
          return order.id.toString() === searchTerm;
        if (filterType === "date" && selectedDate) {
          const orderDate = new Date(order.createdAt)
            .toISOString()
            .split("T")[0];
          return orderDate === selectedDate;
        }
        return true; // Show all orders if searchTerm or selectedDate is empty
      })
    : [];

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date-asc")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "date-desc")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "total-asc") return a.totalAmount - b.totalAmount;
    if (sortBy === "total-desc") return b.totalAmount - a.totalAmount;
    return 0;
  });

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
        <Breadcrumbs title="Profile" />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-base text-black">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
        <Breadcrumbs title="Profile" />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-base text-black mb-4">{error}</p>
          <button
            onClick={() =>
              dispatch(clearOrderError()) ||
              dispatch(fetchUserOrders({ userId: userInfo.id, token }))
            }
            className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
      <Breadcrumbs title="Profile" />
      <h1 className="text-2xl font-semibold text-black border-b-2 border-black pb-2 mb-4">
        My Profile
      </h1>

      {/* Tabs for Profile Sections */}
      <div className="mb-6">
        <div className="flex border-b border-black">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Update Profile
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "orders"
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Order & Payment History
          </button>
        </div>
      </div>

      {/* Profile Update Section */}
      {activeTab === "profile" && (
        <div className="bg-gray-100 p-6 rounded-lg border border-black">
          <h2 className="text-xl font-semibold text-black mb-4">
            Update Profile
          </h2>
          <form className="space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-black mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                defaultValue={userInfo?.firstName || ""}
                className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-black mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                defaultValue={userInfo?.lastName || ""}
                className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="text-sm font-medium text-black mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                defaultValue={userInfo?.email || ""}
                className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-black mb-1"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                defaultValue={userInfo?.phone || ""}
                className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black"
                disabled
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
              disabled
            >
              Save Changes
            </button>
            <p className="text-sm text-gray-500">* API integration pending</p>
          </form>
        </div>
      )}

      {/* Order & Payment History Section */}
      {activeTab === "orders" && (
        <div className="bg-gray-100 p-6 rounded-lg border border-black">
          <h2 className="text-xl font-semibold text-black mb-4">
            Order & Payment History
          </h2>

          {/* Search and Sort */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black w-full sm:w-1/4"
            >
              <option value="orderId">Order ID</option>
              <option value="date">Date</option>
            </select>
            {filterType === "orderId" ? (
              <input
                type="text"
                placeholder="Search by Order ID (e.g., 1, 10)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black w-full sm:w-1/3"
              />
            ) : (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black w-full sm:w-1/3"
              />
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-black rounded text-black bg-white focus:outline-none focus:border-black w-full sm:w-1/3"
            >
              <option value="date-desc">Sort by Date (Newest First)</option>
              <option value="date-asc">Sort by Date (Oldest First)</option>
              <option value="total-desc">Sort by Total (High to Low)</option>
              <option value="total-asc">Sort by Total (Low to High)</option>
            </select>
          </div>

          {sortedOrders.length === 0 ? (
            <p className="text-base text-black">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded-lg border border-black"
                >
                  <p className="text-base text-black">
                    <span className="font-medium">Order ID:</span> #{order.id}
                  </p>
                  <p className="text-base text-black">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-base text-black">
                    <span className="font-medium">Total:</span> $
                    {order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-base text-black">
                    <span className="font-medium">Status:</span> {order.status}
                  </p>
                  <p className="text-base text-black">
                    <span className="font-medium">Payment Status:</span>{" "}
                    {order.paymentStatus}
                  </p>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="mt-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
