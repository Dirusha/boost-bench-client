import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import NavTitle from "./NavTitle";
import {
  clearError,
  fetchTags,
  toggleTagSelection,
} from "../../../../redux/tagsSlice";

const Tags = () => {
  const dispatch = useDispatch();
  const { tags, selectedTags, status, error } = useSelector(
    (state) => state.tags
  );
  const [showTags, setShowTags] = useState(true);

  // Fetch tags when status is idle
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTags());
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
  const handleCheckboxChange = (tagId) => {
    dispatch(toggleTagSelection(tagId));
  };

  if (status === "loading") {
    return (
      <div>
        <NavTitle title="Shop by Tags" icons={true} />
        <p className="text-center text-gray-600">Loading Tags...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div>
        <NavTitle title="Shop by Tags" icons={true} />
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div>
        <NavTitle title="Shop by Tags" icons={true} />
        <p className="text-center text-gray-600">No Tags found.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => setShowTags(!showTags)}
        className="cursor-pointer"
      >
        <NavTitle title="Shop by Tags" icons={true} />
      </div>
      {showTags && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 hover:text-blue-600 hover:border-gray-400 duration-300"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleCheckboxChange(tag.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span>{tag.name}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Tags;
