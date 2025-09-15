// ProductInfo.js - Updated to use cart async thunks
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../../../redux/cartSlice";

const ProductInfo = ({ productInfo }) => {
  const dispatch = useDispatch();
  const { userInfo, token } = useSelector((state) => state.login);
  const { status } = useSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Ensure safe access to productInfo properties
  const stock = productInfo.availableQuantity || 0;
  const price = productInfo.price || 0;
  const discountPercentage = productInfo.discount || 0;
  const hasDiscount = discountPercentage > 0;
  const discountAmount = hasDiscount ? (price * discountPercentage) / 100 : 0;
  const discountedPrice = hasDiscount ? price - discountAmount : price;
  const totalPrice = quantity * discountedPrice;

  // Check if currently adding to cart
  const isLoading = status === "loading";

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      if (value > stock) {
        setQuantity(stock);
        setError(`Only ${stock} items available`);
      } else if (value < 1) {
        setQuantity(1);
        setError("Quantity must be at least 1");
      } else {
        setQuantity(value);
        setError(null);
      }
    }
  };

  const handleAddToCart = async () => {
    // Reset states
    setError(null);
    setSuccess(false);

    // Validation checks
    if (stock <= 0 || quantity > stock) {
      setError("Cannot add to cart: out of stock");
      return;
    }

    if (!userInfo?.id || !token) {
      setError("Please log in to add items to the cart");
      return;
    }

    try {
      // Prepare product data for cart
      const productData = {
        name: productInfo.productName || productInfo.name,
        image: productInfo.img,
        badge: productInfo.badge,
        price: discountedPrice,
        colors: productInfo.color,
        originalPrice: hasDiscount ? price : undefined,
        sku: productInfo.sku,
      };

      // Dispatch add to cart thunk
      await dispatch(
        addItemToCart({
          userId: userInfo.id,
          token,
          productId: productInfo.id,
          quantity,
          productData,
        })
      ).unwrap();

      // Show success message
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err || "Failed to add item to cart");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-lg border border-gray-300">
      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Item added to cart successfully! 🎉
        </div>
      )}

      {/* Product Name */}
      <h2 className="text-3xl font-bold text-black">
        {productInfo.productName || productInfo.name || "Product"}
      </h2>

      {/* Price and Discount */}
      <div className="flex items-center gap-4">
        <p className="text-2xl font-semibold text-black">
          ${discountedPrice.toFixed(2)}
        </p>
        {hasDiscount && (
          <>
            <p className="text-lg line-through text-gray-500">
              ${price.toFixed(2)}
            </p>
            <span className="px-3 py-1 text-sm font-semibold text-white bg-black rounded-full shadow-sm">
              Save {discountPercentage}%
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-base text-gray-700 leading-relaxed">
        {productInfo.description ||
          productInfo.des ||
          "No description available."}
      </p>

      {/* Color */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-black">Color:</span>
        <span className="px-3 py-1 text-sm text-black bg-gray-200 rounded-full border border-gray-300">
          {productInfo.color || "N/A"}
        </span>
      </div>

      {/* Stock and Quantity */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {stock > 0 ? (
            <>
              <div
                className={`w-3 h-3 rounded-full ${
                  stock > 20
                    ? "bg-green-500"
                    : stock > 5
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium text-black">
                In Stock: {stock} available
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-black">
                Out of Stock
              </span>
            </>
          )}
        </div>

        {stock > 0 && (
          <div className="flex items-center gap-4">
            <span className="font-medium text-black">Quantity:</span>
            <div className="flex items-center border border-gray-400 rounded-md overflow-hidden shadow-sm">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || isLoading}
                className="px-4 py-2 text-lg font-medium text-black bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-300"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isLoading}
                className="w-16 py-2 text-center text-lg font-medium border-none focus:outline-none bg-white text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100"
                min="1"
                max={stock}
              />
              <button
                onClick={handleIncrement}
                disabled={quantity >= stock || isLoading}
                className="px-4 py-2 text-lg font-medium text-black bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-300"
              >
                +
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {/* Total Price */}
      <div className="flex items-center gap-4">
        <span className="text-lg font-medium text-black">Total:</span>
        <p className="text-2xl font-bold text-black">
          ${totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={stock === 0 || quantity > stock || !userInfo?.id || isLoading}
        className={`w-full py-3 text-lg font-semibold text-white rounded-lg shadow-md transition-all duration-300 relative ${
          stock > 0 && quantity <= stock && userInfo?.id && !isLoading
            ? "bg-black hover:bg-gray-800 hover:shadow-lg"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {isLoading
          ? "Adding to Cart..."
          : stock > 0
          ? "Add to Cart"
          : "Out of Stock"}
      </button>

      {/* Additional Info */}
      <div className="flex flex-col gap-2 text-sm text-gray-700">
        <p>
          <span className="font-medium text-black">Categories:</span> Spring
          Collection, Streetwear, Women
        </p>
        <p>
          <span className="font-medium text-black">Tags:</span> Featured
        </p>
        <p>
          <span className="font-medium text-black">SKU:</span>{" "}
          {productInfo.sku || "N/A"}
        </p>
      </div>

      {/* Review Prompt */}
      <p className="text-sm text-gray-600 italic">
        Be the first to leave a review.
      </p>
    </div>
  );
};

export default ProductInfo;
