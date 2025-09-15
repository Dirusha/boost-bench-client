import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImPlus } from "react-icons/im";
import NavTitle from "./NavTitle";
import {
  clearError,
  fetchCategories,
  toggleCategorySelection,
} from "./../../../../redux/categoriesSlice";

const Category = () => {
  const dispatch = useDispatch();
  const { categories, selectedCategories, status, error } = useSelector(
    (state) => state.categories
  );
  const [showSubCat, setShowSubCat] = useState({});

  // Fetch categories when status is idle
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
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

  // Handle checkbox toggle
  const handleCheckboxChange = (categoryId) => {
    dispatch(toggleCategorySelection(categoryId));
  };

  // Handle subcategory toggle
  const handleSubCatToggle = (categoryId) => {
    setShowSubCat((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (status === "loading") {
    return (
      <div className="w-full">
        <NavTitle title="Shop by Category" icons={false} />
        <p className="text-center text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full">
        <NavTitle title="Shop by Category" icons={false} />
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="w-full">
        <NavTitle title="Shop by Category" icons={false} />
        <p className="text-center text-gray-600">No categories found.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <NavTitle title="Shop by Category" icons={false} />
      <div>
        <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
          {categories.map((category) => (
            <li
              key={category.id}
              className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCheckboxChange(category.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span>{category.name}</span>
              </div>
              {/* Placeholder for subcategory toggle; update if API provides subcategories */}
              {category.hasSubcategories && (
                <span
                  onClick={() => handleSubCatToggle(category.id)}
                  className="text-[10px] lg:text-xs cursor-pointer text-gray-400 hover:text-blue-600 duration-300"
                >
                  <ImPlus />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Category;
