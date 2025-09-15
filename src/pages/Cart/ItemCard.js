// ItemCard.js - Updated to use async thunks with proper cart item IDs
import React, { useState } from "react";
import { ImCross } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { removeCartItem, updateCartItemQuantity } from "../../redux/cartSlice";

const ItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const { userInfo, token } = useSelector((state) => state.login);
  const { status } = useSelector((state) => state.cart);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if this specific item is being processed
  const isLoading = status === "loading" || localLoading;

  // Remove item from cart
  const handleDeleteItem = async () => {
    if (!userInfo?.id || !token) return;

    if (window.confirm("Remove this item from cart?")) {
      setLocalLoading(true);
      setError(null);

      try {
        // Use cartItemId if available, otherwise use _id (productId)
        const itemIdToRemove = item.cartItemId || item._id;

        await dispatch(
          removeCartItem({
            userId: userInfo.id,
            token,
            itemId: itemIdToRemove,
          })
        ).unwrap();
      } catch (err) {
        setError(err || "Failed to remove item");
      } finally {
        setLocalLoading(false);
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (newQuantity) => {
    if (!userInfo?.id || !token || newQuantity < 1) return;

    setLocalLoading(true);
    setError(null);

    try {
      // Use cartItemId if available, otherwise use _id (productId)
      const itemIdToUpdate = item.cartItemId || item._id;

      await dispatch(
        updateCartItemQuantity({
          userId: userInfo.id,
          token,
          itemId: itemIdToUpdate,
          quantity: newQuantity,
        })
      ).unwrap();
    } catch (err) {
      setError(err || "Failed to update quantity");
    } finally {
      setLocalLoading(false);
    }
  };

  // Increase quantity
  const handleIncreaseQuantity = () => {
    if (item.quantity < (item.availableQuantity || 999)) {
      const newQuantity = item.quantity + 1;
      updateQuantity(newQuantity);
    }
  };

  // Decrease quantity
  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      updateQuantity(newQuantity);
    }
  };

  // Handle direct input change
  const handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (
      !isNaN(value) &&
      value > 0 &&
      value <= (item.availableQuantity || 999)
    ) {
      updateQuantity(value);
    }
  };

  // Calculate current price (considering discount)
  const currentPrice = item.originalPrice
    ? item.originalPrice - (item.discount || 0)
    : item.price;
  const hasDiscount = item.originalPrice && item.originalPrice > currentPrice;

  return (
    <div className="w-full grid grid-cols-5 mb-4 border py-2 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Updating...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-2 py-1 text-xs z-20 rounded-t">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold hover:text-red-900 ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Product Error Display (if product details failed to load) */}
      {item.error && (
        <div className="absolute top-6 left-0 right-0 bg-yellow-100 border border-yellow-400 text-yellow-700 px-2 py-1 text-xs z-20">
          {item.error}
        </div>
      )}

      {/* Product Info Column */}
      <div className="flex col-span-5 mdl:col-span-2 items-center gap-4 ml-4">
        <ImCross
          onClick={handleDeleteItem}
          className={`text-primeColor hover:text-red-500 duration-300 cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Remove item"
        />

        <img
          className="w-32 h-32 object-cover rounded border border-gray-200"
          src={item.image || "/placeholder-image.jpg"}
          alt={item.name || "Product"}
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
          }}
        />

        <div className="flex flex-col gap-1">
          <h1 className="font-titleFont font-semibold text-lg">
            {item.name || "Unnamed Product"}
          </h1>

          {/* Product Description */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Product Details */}
          {item.colors && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Color:</span>
              <span className="text-sm font-medium">{item.colors}</span>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded w-fit">
              {item.discount}% OFF
            </span>
          )}

          {/* Stock Information */}
          {item.availableQuantity && item.availableQuantity < 10 && (
            <span className="text-xs text-orange-600">
              Only {item.availableQuantity} left in stock
            </span>
          )}

          {/* SKU if available */}
          {item.sku && (
            <span className="text-xs text-gray-500">SKU: {item.sku}</span>
          )}
        </div>
      </div>

      {/* Price, Quantity, and Subtotal Columns */}
      <div className="col-span-5 mdl:col-span-3 flex items-center justify-between py-4 mdl:py-0 px-4 mdl:px-0 gap-6 mdl:gap-0">
        {/* Price Column */}
        <div className="flex w-1/3 items-center text-lg font-semibold">
          <div className="flex flex-col">
            <span>${currentPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Column */}
        <div className="w-1/3 flex items-center justify-center gap-3">
          <button
            onClick={handleDecreaseQuantity}
            disabled={isLoading || item.quantity <= 1}
            className={`w-8 h-8 bg-gray-100 text-xl flex items-center justify-center hover:bg-gray-200 cursor-pointer duration-300 border border-gray-300 rounded ${
              isLoading || item.quantity <= 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="Decrease quantity"
          >
            -
          </button>

          <div className="flex flex-col items-center">
            <input
              type="number"
              value={item.quantity || 1}
              onChange={handleQuantityInputChange}
              disabled={isLoading}
              className="w-16 h-8 text-center border border-gray-300 rounded text-sm font-medium disabled:bg-gray-100"
              min="1"
              max={item.availableQuantity || 999}
            />
            {item.availableQuantity && (
              <span className="text-xs text-gray-500 mt-1">
                Max: {item.availableQuantity}
              </span>
            )}
          </div>

          <button
            onClick={handleIncreaseQuantity}
            disabled={
              isLoading || item.quantity >= (item.availableQuantity || 999)
            }
            className={`w-8 h-8 bg-gray-100 text-xl flex items-center justify-center hover:bg-gray-200 cursor-pointer duration-300 border border-gray-300 rounded ${
              isLoading || item.quantity >= (item.availableQuantity || 999)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Subtotal Column */}
        <div className="w-1/3 flex items-center justify-end font-titleFont font-bold text-lg">
          <div className="flex flex-col items-end">
            <span>${((item.quantity || 1) * currentPrice).toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${((item.quantity || 1) * item.originalPrice).toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs text-green-600">
                You save: $
                {((item.quantity || 1) * (item.discount || 0)).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
