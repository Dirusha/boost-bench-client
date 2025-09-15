import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import { fetchSpecialOffers, clearError } from "../../../redux/productsSlice";

const FALLBACK_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXexNoklsp_TJ3LgYzhTxXFYypXv1xDvkzQ&s";

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

const SpecialOffers = () => {
  const dispatch = useDispatch();
  const { specialOffers, status, error } = useSelector(
    (state) => state.products
  );
  const [currentImages, setCurrentImages] = useState({});

  // Use useMemo to prevent unnecessary re-normalization
  const normalizedSpecialOffers = useMemo(() => {
    return specialOffers.map(normalizeProduct);
  }, [specialOffers]);

  // Fetch special offers when status is idle
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSpecialOffers());
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
    if (normalizedSpecialOffers.length > 0) {
      const initialImages = {};
      normalizedSpecialOffers.forEach((product) => {
        if (product.imageUrls && product.imageUrls.length > 1) {
          initialImages[product.id] = 0; // Start with the first image
        }
      });
      setCurrentImages(initialImages);
    }
  }, [normalizedSpecialOffers]);

  // Auto-change images every 3 seconds for products with multiple images
  useEffect(() => {
    const intervals = {};

    normalizedSpecialOffers.forEach((product) => {
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
  }, [normalizedSpecialOffers]);

  if (status === "loading") {
    return (
      <div className="w-full pb-20">
        <Heading heading="Special Offers" />
        <p className="text-center text-gray-600">Loading special offers...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full pb-20">
        <Heading heading="Special Offers" />
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (normalizedSpecialOffers.length === 0) {
    return (
      <div className="w-full pb-20">
        <Heading heading="Special Offers" />
        <p className="text-center text-gray-600">No special offers found.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <Heading heading="Special Offers" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {normalizedSpecialOffers.map((product) => (
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

export default SpecialOffers;
