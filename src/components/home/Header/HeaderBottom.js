import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { FaSearch, FaUser, FaCaretDown, FaShoppingCart } from "react-icons/fa";
import Flex from "../../designLayouts/Flex";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../redux/loginSlice";
import { fetchAllProducts } from "../../../redux/productsSlice";

const HeaderBottom = () => {
  const { filteredProducts, allProducts, status } = useSelector(
    (state) => state.products
  );
  const products = useSelector((state) => state.orebi.products);
  const { userInfo } = useSelector((state) => state.login);
  const [show, setShow] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ref = useRef();
  const location = useLocation();

  // Fetch all products on component mount for search functionality
  useEffect(() => {
    if (allProducts.length === 0) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, allProducts.length]);

  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      if (ref.current.contains(e.target)) {
        setShow(true);
      } else {
        setShow(false);
      }
    });
  }, [show, ref]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSearchResults, setFilteredSearchResults] = useState([]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUser(false);
    navigate("/");
  };

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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSearchResults([]);
      return;
    }

    // Determine which products to search from based on current page
    let productsToSearch = [];

    if (location.pathname === "/shop" && filteredProducts.length > 0) {
      // On shop page, search from filtered products
      productsToSearch = filteredProducts;
    } else if (allProducts.length > 0) {
      // On other pages, search from all products
      productsToSearch = allProducts;
    }

    if (productsToSearch.length > 0) {
      const filtered = productsToSearch
        .filter((item) => {
          const productName = item.name || item.productName || "";
          const description = item.description || item.des || "";
          const searchLower = searchQuery.toLowerCase();

          return (
            productName.toLowerCase().includes(searchLower) ||
            description.toLowerCase().includes(searchLower)
          );
        })
        .map(normalizeProduct); // Normalize each product

      setFilteredSearchResults(filtered);
    } else {
      setFilteredSearchResults([]);
    }
  }, [searchQuery, filteredProducts, allProducts, location.pathname]);

  const handleProductClick = (item) => {
    // Ensure the product data is properly normalized before navigation
    const normalizedItem = normalizeProduct(item);

    navigate(`/product/${normalizedItem.id}`, {
      state: { item: normalizedItem },
    });
    setSearchQuery("");
  };

  return (
    <div className="w-full bg-[#F5F5F3] relative">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
          <div
            onClick={() => setShow(!show)}
            ref={ref}
            className="flex h-14 cursor-pointer items-center gap-2 text-primeColor"
          >
            <HiOutlineMenuAlt4 className="w-5 h-5" />
            <p className="text-[14px] font-normal">Shop by Category</p>

            {show && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-36 z-50 bg-primeColor w-auto text-[#767676] h-auto p-4 pb-6"
              >
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Accessories
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Furniture
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Electronics
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Clothes
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Bags
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Home appliances
                </li>
              </motion.ul>
            )}
          </div>
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-primeColor bg-white flex items-center gap-2 justify-between px-6 rounded-xl">
            <input
              className="flex-1 h-full outline-none placeholder:text-[#C4C4C4] placeholder:text-[14px]"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search your products here"
            />
            <FaSearch className="w-5 h-5" />
            {searchQuery && (
              <div
                className={`w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-2xl scrollbar-hide cursor-pointer`}
              >
                {status === "loading" ? (
                  <p className="text-center text-gray-600 p-4">
                    Loading products...
                  </p>
                ) : status === "failed" ? (
                  <p className="text-center text-red-600 p-4">
                    Error loading products
                  </p>
                ) : filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((item) => (
                    <div
                      onClick={() => handleProductClick(item)}
                      key={item.id}
                      className="max-w-[600px] h-28 bg-gray-100 mb-3 flex items-center gap-3 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <img
                        className="w-24 h-24 object-cover rounded"
                        src={
                          item.imageUrls && item.imageUrls.length > 0
                            ? item.imageUrls[0]
                            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXexNoklsp_TJ3LgYzhTxXFYypXv1xDvkzQ&s"
                        }
                        alt={item.name}
                        onError={(e) => {
                          e.target.src =
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXexNoklsp_TJ3LgYzhTxXFYypXv1xDvkzQ&s";
                        }}
                      />
                      <div className="flex flex-col gap-1 flex-1 pr-3">
                        <p className="font-semibold text-lg text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-700">
                          Price:{" "}
                          <span className="text-primeColor font-semibold">
                            ${item.price.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 p-4">
                    No products found for "{searchQuery}".
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 lg:mt-0 items-center pr-6 cursor-pointer relative">
            <div onClick={() => setShowUser(!showUser)} className="flex">
              <FaUser />
              <FaCaretDown />
            </div>
            {showUser && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-6 left-0 z-50 bg-primeColor w-44 text-[#767676] h-auto p-4 pb-6"
              >
                {userInfo ? (
                  <>
                    <Link to="/profile">
                      <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                        Profile
                      </li>
                    </Link>
                    <li
                      onClick={handleLogout}
                      className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer"
                    >
                      Logout
                    </li>
                  </>
                ) : (
                  <>
                    <Link to="/signin">
                      <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                        Login
                      </li>
                    </Link>
                    <Link onClick={() => setShowUser(false)} to="/signup">
                      <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                        Sign Up
                      </li>
                    </Link>
                  </>
                )}
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                  Others
                </li>
              </motion.ul>
            )}
            <Link to="/cart">
              <div className="relative">
                <FaShoppingCart />
                <span className="absolute font-titleFont top-3 -right-2 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-primeColor text-white">
                  {products.length > 0 ? products.length : 0}
                </span>
              </div>
            </Link>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;
