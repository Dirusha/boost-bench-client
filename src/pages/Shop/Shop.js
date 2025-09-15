import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Pagination from "../../components/pageProps/shopPage/Pagination";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { clearError, fetchFilteredProducts } from "../../redux/productsSlice";

const Shop = () => {
  const dispatch = useDispatch();
  const { selectedCategories } = useSelector((state) => state.categories);
  const { selectedTags } = useSelector((state) => state.tags);
  const { priceRanges, selectedPriceRanges } = useSelector(
    (state) => state.priceRanges
  );
  const { status, error } = useSelector((state) => state.products);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
  };

  // Fetch filtered products when filters or itemsPerPage change
  useEffect(() => {
    dispatch(
      fetchFilteredProducts({
        selectedCategories,
        selectedTags,
        selectedPriceRanges,
        priceRanges,
      })
    );
  }, [
    dispatch,
    selectedCategories,
    selectedTags,
    selectedPriceRanges,
    priceRanges,
    itemsPerPage,
  ]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Products" />
      {/* ================= Products Start here =================== */}
      <div className="w-full h-full flex pb-20 gap-10">
        <div className="w-[20%] lgl:w-[25%] hidden mdl:inline-flex h-full">
          <ShopSideNav />
        </div>
        <div className="w-full mdl:w-[80%] lgl:w-[75%] h-full flex flex-col gap-10">
          {status === "loading" && (
            <p className="text-center text-gray-600">Loading products...</p>
          )}
          {status === "failed" && (
            <p className="text-center text-red-600">Error: {error}</p>
          )}
          <ProductBanner itemsPerPageFromBanner={itemsPerPageFromBanner} />
          <Pagination itemsPerPage={itemsPerPage} />
        </div>
      </div>
      {/* ================= Products End here ===================== */}
    </div>
  );
};

export default Shop;
