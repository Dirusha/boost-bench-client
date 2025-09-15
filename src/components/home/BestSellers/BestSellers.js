import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import { fetchBestSellers, clearError } from "../../../redux/productsSlice";

// Fallback image URL for products with no images
const FALLBACK_IMAGE = "https://via.placeholder.com/150?text=No+Image";

// Normalize product data to ensure consistent structure
const normalizeProduct = (product) => {
  return {
    ...product,
    // Standardize name property
    name: product.name || product.productName || "Unnamed Product",
    productName: product.productName || product.name || "Unnamed Product",
    // Standardize description
    description:
      product.description || product.des || "No description available",
    des: product.des || product.description || "No description available",
    // Standardize image properties
    imageUrls: product.imageUrls || (product.img ? [product.img] : []),
    img:
      product.img ||
      (product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : ""),
    // Ensure price is a number
    price:
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price || 0,
    // Ensure other properties exist
    id: product.id || product._id,
    color: product.color || "Not specified",
    discount: product.discount || 0,
  };
};

const BestSellers = () => {
  const dispatch = useDispatch();
  const { bestSellers, status, error } = useSelector((state) => state.products);
  const [currentImages, setCurrentImages] = useState({});

  // Use useMemo to prevent unnecessary re-normalization
  const normalizedBestSellers = useMemo(() => {
    return bestSellers.map(normalizeProduct);
  }, [bestSellers]);

  // Fetch bestsellers when status is idle
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBestSellers());
    }
  }, [dispatch, status]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Initialize image indices for products with multiple images
  useEffect(() => {
    if (normalizedBestSellers.length > 0) {
      const initialImages = {};
      normalizedBestSellers.forEach((product) => {
        if (product.imageUrls && product.imageUrls.length > 1) {
          initialImages[product.id] = 0; // Start with the first image
        }
      });
      setCurrentImages(initialImages);
    }
  }, [normalizedBestSellers]);

  // Auto-change images every 3 seconds for products with multiple images
  useEffect(() => {
    const intervals = {};

    normalizedBestSellers.forEach((product) => {
      if (product.imageUrls && product.imageUrls.length > 1) {
        intervals[product.id] = setInterval(() => {
          setCurrentImages((prev) => ({
            ...prev,
            [product.id]: (prev[product.id] + 1) % product.imageUrls.length,
          }));
        }, 3000); // Change every 3 seconds
      }
    });

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  }, [normalizedBestSellers]);

  if (status === "loading") {
    return (
      <div className="w-full pb-20">
        <Heading heading="Our Bestsellers" />
        <p className="text-center text-gray-600">Loading bestsellers...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full pb-20">
        <Heading heading="Our Bestsellers" />
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (normalizedBestSellers.length === 0) {
    return (
      <div className="w-full pb-20">
        <Heading heading="Our Bestsellers" />
        <p className="text-center text-gray-600">No bestsellers found.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <Heading heading="Our Bestsellers" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {normalizedBestSellers.map((product) => (
          <Product
            key={product.id}
            _id={product.id.toString()}
            img={
              product.imageUrls && product.imageUrls.length > 0
                ? product.imageUrls[
                    currentImages[product.id] !== undefined
                      ? currentImages[product.id]
                      : 0
                  ]
                : FALLBACK_IMAGE
            }
            productName={product.name}
            price={product.price.toFixed(2)}
            color={product.color}
            badge={product.discount > 0}
            des={product.description}
            imageStyle={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "8px",
            }}
            // Pass the normalized item data for navigation
            item={product}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
