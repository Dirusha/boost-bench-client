import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import SampleNextArrow from "./SampleNextArrow";
import SamplePrevArrow from "./SamplePrevArrow";
import { fetchNewArrivals, clearError } from "../../../redux/productsSlice";

// Default image URL with fixed dimensions
const DEFAULT_IMAGE =
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

const NewArrivals = () => {
  const dispatch = useDispatch();
  const { newArrivals, status, error } = useSelector((state) => state.products);
  const [currentImages, setCurrentImages] = useState({});

  // Use useMemo to prevent unnecessary re-normalization
  const normalizedArrivals = useMemo(() => {
    return newArrivals.map(normalizeProduct);
  }, [newArrivals]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNewArrivals());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Set initial image indices for products with multiple images
  useEffect(() => {
    if (normalizedArrivals.length > 0) {
      const initialImages = {};
      normalizedArrivals.forEach((product) => {
        if (product.imageUrls && product.imageUrls.length > 1) {
          initialImages[product.id] = 0; // Start with the first image
        }
      });
      setCurrentImages(initialImages);
    }
  }, [normalizedArrivals]);

  // Auto-change images every 3 seconds for products with multiple images
  useEffect(() => {
    const intervals = {};

    normalizedArrivals.forEach((product) => {
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
  }, [normalizedArrivals]);

  // Adjust slider settings based on number of products
  const getSliderSettings = () => {
    const productCount = normalizedArrivals.length;

    return {
      infinite: productCount > 4, // Only enable infinite scroll if we have more than 4 products
      speed: 500,
      slidesToShow: Math.min(4, productCount), // Don't show more slides than products
      slidesToScroll: 1,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: Math.min(3, productCount),
            slidesToScroll: 1,
            infinite: productCount > 3,
          },
        },
        {
          breakpoint: 769,
          settings: {
            slidesToShow: Math.min(2, productCount),
            slidesToScroll: 1,
            infinite: productCount > 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: productCount > 1,
          },
        },
      ],
    };
  };

  if (status === "loading") {
    return (
      <div className="w-full pb-16">
        <Heading heading="New Arrivals" />
        <p className="text-center">Loading new arrivals...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full pb-16">
        <Heading heading="New Arrivals" />
        <p className="text-red-500 text-center">
          Failed to load new arrivals: {error}
        </p>
      </div>
    );
  }

  if (normalizedArrivals.length === 0) {
    return (
      <div className="w-full pb-16">
        <Heading heading="New Arrivals" />
        <p className="text-center">No new arrivals found.</p>
      </div>
    );
  }

  console.log("New Arrivals Data:", normalizedArrivals); // Debug log

  return (
    <div className="w-full pb-16">
      <Heading heading="New Arrivals" />
      <Slider {...getSliderSettings()}>
        {normalizedArrivals.map((product) => (
          <div className="px-2" key={`product-${product.id}`}>
            <div className="w-full h-auto">
              <Product
                _id={product.id}
                img={
                  product.imageUrls && product.imageUrls.length > 0
                    ? product.imageUrls[
                        currentImages[product.id] !== undefined
                          ? currentImages[product.id]
                          : 0
                      ]
                    : DEFAULT_IMAGE
                }
                productName={product.name}
                price={product.price.toFixed(2)}
                color={product.color}
                badge={product.discount > 0}
                des={product.description}
                imageStyle={{
                  width: "100%",
                  height: "250px", // Fixed height for all product images
                  objectFit: "cover", // Ensures image covers the area while maintaining aspect ratio
                  objectPosition: "center", // Centers the image
                  borderRadius: "8px", // Optional: adds rounded corners
                }}
                // Pass the normalized item data for navigation
                item={product}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default NewArrivals;
