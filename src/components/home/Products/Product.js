import React from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { GiReturnArrow } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import Image from "../../designLayouts/Image";
import Badge from "./Badge";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const Product = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use the full item data if available, otherwise fallback to individual props
  const productData = props.item || {
    id: props._id,
    _id: props._id,
    name: props.productName,
    productName: props.productName,
    description: props.des,
    des: props.des,
    price: parseFloat(props.price) || 0,
    color: props.color,
    imageUrls: [props.img],
    img: props.img,
    discount: props.badge ? 10 : 0,
    badge: props.badge,
  };

  // Create a proper ID string for the URL
  const createUrlId = (product) => {
    const name = product.name || product.productName || "product";
    const id = product.id || product._id || "0";
    return `${String(name).toLowerCase().split(" ").join("-")}-${id}`;
  };

  const urlId = createUrlId(productData);

  const handleProductDetails = () => {
    console.log("Navigating with product data:", productData);
    navigate(`/product/${urlId}`, {
      state: {
        item: productData,
      },
    });
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: productData.id || productData._id,
        name: productData.name || productData.productName,
        quantity: 1,
        image:
          productData.img ||
          (productData.imageUrls && productData.imageUrls[0]),
        badge: productData.badge || productData.discount > 0,
        price: productData.price,
        colors: productData.color,
      })
    );
  };

  return (
    <div className="w-full relative group">
      <div className="max-w-80 max-h-80 relative overflow-y-hidden ">
        <div>
          <Image
            className="w-full h-48 md:h-56 lg:h-64 object-cover"
            imgSrc={props.img}
            style={props.imageStyle}
          />
        </div>
        <div className="absolute top-6 left-8">
          {(props.badge || productData.discount > 0) && <Badge text="New" />}
        </div>
        <div className="w-full h-32 absolute bg-white -bottom-[130px] group-hover:bottom-0 duration-700">
          <ul className="w-full h-full flex flex-col items-end justify-center gap-2 font-titleFont px-2 border-l border-r">
            <li className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full">
              Compare
              <span>
                <GiReturnArrow />
              </span>
            </li>
            <li
              onClick={handleAddToCart}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              Add to Cart
              <span>
                <FaShoppingCart />
              </span>
            </li>
            <li
              onClick={handleProductDetails}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              View Details
              <span className="text-lg">
                <MdOutlineLabelImportant />
              </span>
            </li>
            <li className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full">
              Add to Wish List
              <span>
                <BsSuitHeartFill />
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-80 py-6 flex flex-col gap-1 border-[1px] border-t-0 px-4">
        <div className="flex items-center justify-between font-titleFont">
          <h2 className="text-lg text-primeColor font-bold">
            {props.productName}
          </h2>
          <p className="text-[#767676] text-[14px]">RS {props.price}</p>
        </div>
        <div>
          <p className="text-[#767676] text-[14px]">{props.color}</p>
        </div>
      </div>
    </div>
  );
};

export default Product;
