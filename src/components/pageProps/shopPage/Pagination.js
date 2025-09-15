import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import Product from "../../home/Products/Product";

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

function Items({ currentItems }) {
  const [currentImages, setCurrentImages] = useState({});

  // Use useMemo to prevent unnecessary re-normalization
  const normalizedItems = useMemo(() => {
    return currentItems.map(normalizeProduct);
  }, [currentItems]);

  // Set initial image indices for products with multiple images
  useEffect(() => {
    if (normalizedItems.length > 0) {
      const initialImages = {};
      normalizedItems.forEach((product) => {
        if (product.imageUrls && product.imageUrls.length > 1) {
          initialImages[product.id] = 0; // Start with the first image
        }
      });
      setCurrentImages(initialImages);
    }
  }, [normalizedItems]);

  // Auto-change images every 3 seconds for products with multiple images
  useEffect(() => {
    const intervals = {};

    normalizedItems.forEach((product) => {
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
  }, [normalizedItems]);

  return (
    <>
      {normalizedItems && normalizedItems.length > 0 ? (
        normalizedItems.map((item) => (
          <div key={item.id} className="w-full">
            <Product
              _id={item.id}
              img={
                item.imageUrls && item.imageUrls.length > 0
                  ? item.imageUrls[
                      currentImages[item.id] !== undefined
                        ? currentImages[item.id]
                        : 0
                    ]
                  : DEFAULT_IMAGE
              }
              productName={item.name}
              price={item.price.toFixed(2)}
              color={item.color}
              badge={item.discount > 0}
              des={item.description}
              imageStyle={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "8px",
              }}
              // Pass the normalized item data for navigation
              item={item}
            />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600 col-span-full">
          No products found.
        </p>
      )}
    </>
  );
}

const Pagination = ({ itemsPerPage }) => {
  const { filteredProducts } = useSelector((state) => state.products);
  const [itemOffset, setItemOffset] = useState(0);
  const [itemStart, setItemStart] = useState(1);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredProducts.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  // Invoke when user clicks to request another page
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredProducts.length;
    setItemOffset(newOffset);
    setItemStart(newOffset === 0 ? 1 : newOffset);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mdl:gap-4 lg:gap-10">
        <Items currentItems={currentItems} />
      </div>
      <div className="flex flex-col mdl:flex-row justify-center mdl:justify-between items-center">
        <ReactPaginate
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          pageCount={pageCount}
          previousLabel=""
          pageLinkClassName="w-9 h-9 border-[1px] border-lightColor hover:border-gray-500 duration-300 flex justify-center items-center"
          pageClassName="mr-6"
          containerClassName="flex text-base font-semibold font-titleFont py-10"
          activeClassName="bg-black text-white"
        />
        <p className="text-base font-normal text-lightText">
          Products from {itemStart} to{" "}
          {Math.min(endOffset, filteredProducts.length)} of{" "}
          {filteredProducts.length}
        </p>
      </div>
    </div>
  );
};

export default Pagination;
