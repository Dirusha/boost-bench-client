import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavTitle from "./NavTitle";
import {
  addPriceRange,
  removePriceRange,
  togglePriceRangeSelection,
} from "../../../../redux/priceRangesSlice";

const Price = () => {
  const dispatch = useDispatch();
  const { priceRanges, selectedPriceRanges } = useSelector(
    (state) => state.priceRanges
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Handle adding a new price range
  const handleAddPriceRange = () => {
    const priceOne = parseFloat(minPrice);
    const priceTwo = parseFloat(maxPrice);
    if (
      !isNaN(priceOne) &&
      !isNaN(priceTwo) &&
      priceOne >= 0 &&
      priceTwo > priceOne
    ) {
      dispatch(addPriceRange({ priceOne, priceTwo }));
      setMinPrice("");
      setMaxPrice("");
    } else {
      alert("Please enter valid price range (Min >= 0 and Max > Min).");
    }
  };

  // Handle radio button change - only allow single selection
  const handleRadioChange = (priceRangeId) => {
    // If the same item is clicked and already selected, deselect it
    if (selectedPriceRanges.includes(priceRangeId)) {
      dispatch(togglePriceRangeSelection(priceRangeId));
    } else {
      // Clear all selections first, then select the new one
      selectedPriceRanges.forEach((id) => {
        dispatch(togglePriceRangeSelection(id));
      });
      dispatch(togglePriceRangeSelection(priceRangeId));
    }
  };

  // Handle removing a price range
  const handleRemovePriceRange = (priceRangeId) => {
    dispatch(removePriceRange(priceRangeId));
  };

  return (
    <div className="cursor-pointer">
      <NavTitle title="Shop by Price" icons={false} />
      <div className="font-titleFont">
        {/* Input fields for custom price range */}
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min Price"
            className="w-1/2 p-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Price"
            className="w-1/2 p-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleAddPriceRange}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 duration-300"
          >
            Add
          </button>
        </div>
        {/* Price range list */}
        {priceRanges.length === 0 ? (
          <p className="text-center text-gray-600">No price ranges added.</p>
        ) : (
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {priceRanges.map((item) => (
              <li
                key={item.id}
                className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 hover:text-black hover:border-gray-400 duration-300"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={selectedPriceRanges.includes(item.id)}
                  onChange={() => handleRadioChange(item.id)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300"
                />
                <span>
                  ${item.priceOne.toFixed(2)} - ${item.priceTwo.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemovePriceRange(item.id)}
                  className="ml-auto text-red-500 text-xs hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Price;
