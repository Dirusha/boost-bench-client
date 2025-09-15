import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpecialOffers, clearError } from "../../../redux/productsSlice";

// Default image URL with fixed dimensions
const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXexNoklsp_TJ3LgYzhTxXFYypXv1xDvkzQ&s";

// Limit to 5 products
const PRODUCT_LIMIT = 4;

const ProductsOnSale = () => {
  const dispatch = useDispatch();
  const { specialOffers, status, error } = useSelector(
    (state) => state.products
  );
  const [currentImages, setCurrentImages] = useState({});

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

  // Set initial image indices for products with multiple images
  useEffect(() => {
    if (specialOffers.length > 0) {
      const initialImages = {};
      specialOffers.slice(0, PRODUCT_LIMIT).forEach((product) => {
        if (product.imageUrls && product.imageUrls.length > 1) {
          initialImages[product.id] = 0; // Start with the first image
        }
      });
      setCurrentImages(initialImages);
    }
  }, [specialOffers]);

  // Auto-change images every 3 seconds for products with multiple images
  useEffect(() => {
    const intervals = {};

    specialOffers.slice(0, PRODUCT_LIMIT).forEach((product) => {
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
  }, [specialOffers]);

  if (status === "loading") {
    return (
      <div>
        <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
          Products on sale
        </h3>
        <p className="text-center text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div>
        <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
          Products on sale
        </h3>
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
        Products on sale
      </h3>
      <div className="flex flex-col gap-2">
        {specialOffers && specialOffers.length > 0 ? (
          specialOffers.slice(0, PRODUCT_LIMIT).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b-[1px] border-b-gray-300 py-2"
            >
              <div>
                <img
                  className="w-24"
                  src={
                    item.imageUrls && item.imageUrls.length > 0
                      ? item.imageUrls[
                          currentImages[item.id] !== undefined
                            ? currentImages[item.id]
                            : 0
                        ]
                      : DEFAULT_IMAGE
                  }
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 font-titleFont">
                <p className="text-base font-medium">{item.name}</p>
                <p className="text-sm font-semibold">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No products on sale.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsOnSale;
