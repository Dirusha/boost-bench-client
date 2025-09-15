import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductInfo from "../../components/pageProps/productDetails/ProductInfo";
import ProductsOnSale from "../../components/pageProps/productDetails/ProductsOnSale";

// Normalize product data to ensure consistent structure
const normalizeProduct = (product) => {
  if (!product) return {};

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

const ProductDetails = () => {
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState("");
  const [productInfo, setProductInfo] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const item = location.state?.item;
    if (item) {
      // Normalize the product data structure
      const normalizedProduct = normalizeProduct(item);
      setProductInfo(normalizedProduct);
      setSelectedImageIndex(0); // Reset to first image when product changes
    }
    setPrevLocation(location.pathname);
  }, [location]);

  // Get all available images with proper fallback
  const getAllImages = () => {
    const images = [];

    // Add images from imageUrls array
    if (productInfo.imageUrls && productInfo.imageUrls.length > 0) {
      // Filter out any invalid/empty URLs
      const validImages = productInfo.imageUrls.filter(
        (url) => url && url.trim() !== ""
      );
      images.push(...validImages);
    } else if (productInfo.img && productInfo.img.trim() !== "") {
      // Fallback to single img property
      images.push(productInfo.img);
    }

    // If no valid images, add fallback
    if (images.length === 0) {
      images.push(
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXexNoklsp_TJ3LgYzhTxXFYypXv1xDvkzQ&s"
      );
    }

    return images;
  };

  const images = getAllImages();
  const mainImage = images[selectedImageIndex] || images[0];

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      nextImage();
    } else if (e.key === "ArrowLeft") {
      prevImage();
    }
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXexNoklsp_TJ3LgYzhTxXFYypXv1xDvkzQ&s";
  };

  // Add keyboard event listeners
  useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen, images.length]);

  return (
    <div className="w-full mx-auto border-b-[1px] border-b-gray-300">
      <div className="max-w-container mx-auto px-4">
        <div className="xl:-mt-10 -mt-7">
          <Breadcrumbs title="" prevLocation={prevLocation} />
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 h-full -mt-5 xl:-mt-8 pb-10 bg-gray-100 p-4">
          <div className="h-full">
            <ProductsOnSale />
          </div>
          <div className="h-full xl:col-span-2 flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full h-96 bg-white rounded-lg overflow-hidden shadow-md cursor-zoom-in">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                src={mainImage}
                alt={productInfo.productName || productInfo.name || "Product"}
                onClick={openLightbox}
                onError={handleImageError}
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={image}
                      alt={`${
                        productInfo.productName || productInfo.name || "Product"
                      } ${index + 1}`}
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="text-center text-sm text-gray-600">
                {selectedImageIndex + 1} of {images.length}
              </div>
            )}
          </div>
          <div className="h-full w-full md:col-span-2 xl:col-span-3  flex flex-col gap-6 justify-center">
            <ProductInfo productInfo={productInfo} />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-10"
          >
            ×
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ›
            </button>
          )}

          {/* Main lightbox image */}
          <div className="max-w-4xl max-h-full flex items-center justify-center">
            <img
              className="max-w-full max-h-full object-contain"
              src={mainImage}
              alt={productInfo.productName || productInfo.name || "Product"}
              onError={handleImageError}
            />
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImageIndex + 1} of {images.length}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded">
            Press ESC to close {images.length > 1 && "• Use ← → to navigate"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
