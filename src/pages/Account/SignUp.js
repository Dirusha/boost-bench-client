import React, { useState, useEffect } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { logoLight } from "../../assets/images";
import { useDispatch, useSelector } from "react-redux";
import {
  setClientName,
  setEmail,
  setPhone,
  setPassword,
  setAddress,
  setCity,
  setCountry,
  setZip,
  setChecked,
  signupStart,
  signupSuccess,
  signupFailure,
  clearMessages,
} from "../../redux/authSlice";
import axios from "axios";

const SignUp = () => {
  const dispatch = useDispatch();
  const {
    clientName,
    email,
    phone,
    password,
    address,
    city,
    country,
    zip,
    successMsg,
    errorMsg,
    isValidationError,
    loading,
    checked,
  } = useSelector((state) => state.authReducer);

  // Email Validation
  const EmailValidation = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  };

  // Handle Input Changes
  const handleName = (e) => dispatch(setClientName(e.target.value));
  const handleEmail = (e) => dispatch(setEmail(e.target.value));
  const handlePhone = (e) => dispatch(setPhone(e.target.value));
  const handlePassword = (e) => dispatch(setPassword(e.target.value));
  const handleAddress = (e) => dispatch(setAddress(e.target.value));
  const handleCity = (e) => dispatch(setCity(e.target.value));
  const handleCountry = (e) => dispatch(setCountry(e.target.value));
  const handleZip = (e) => dispatch(setZip(e.target.value));
  const handleChecked = () => dispatch(setChecked(!checked));

  // Handle Signup
  const handleSignUp = async (e) => {
    e.preventDefault();
    dispatch(clearMessages());

    if (!checked) {
      dispatch(
        signupFailure("Please agree to the Terms of Service and Privacy Policy")
      );
      return;
    }

    const validationErrors = {};
    if (!clientName) validationErrors.clientName = "Enter your name";
    if (!email) validationErrors.email = "Enter your email";
    else if (!EmailValidation(email))
      validationErrors.email = "Enter a Valid email";
    if (!phone) validationErrors.phone = "Enter your phone number";
    if (!password) validationErrors.password = "Create a password";
    else if (password.length < 6)
      validationErrors.password = "Passwords must be at least 6 characters";
    if (!address) validationErrors.address = "Enter your address";
    if (!city) validationErrors.city = "Enter your city name";
    if (!country)
      validationErrors.country = "Enter the country you are residing";
    if (!zip) validationErrors.zip = "Enter the zip code of your area";

    if (Object.keys(validationErrors).length > 0) {
      dispatch(signupFailure(JSON.stringify(validationErrors)));
      return;
    }

    dispatch(signupStart());
    try {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"; // Fallback URL
      if (!process.env.REACT_APP_API_BASE_URL) {
        console.error(
          "REACT_APP_API_BASE_URL is not set. Using fallback URL:",
          apiBaseUrl
        );
      }
      const response = await axios.post(`${apiBaseUrl}/auth/register`, {
        username: email,
        password,
        fullName: clientName,
        workEmail: email,
        phoneNumber: phone,
        address,
        city,
        country,
        zipCode: zip,
      });
      const currentDateTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }); // 05:54 PM +0530 on Wednesday, September 10, 2025
      dispatch(
        signupSuccess(
          `Hello dear ${clientName}, Welcome you to OREBI Admin panel. We received your Sign up request on ${currentDateTime} IST. We are processing to validate your access. Till then stay connected and additional assistance will be sent to you by your mail at ${email}`
        )
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "An error occurred during signup (Check if the backend is running)";
      dispatch(signupFailure(errorMsg));
    }
  };

  // Clear messages when unmounting or changing route
  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  return (
    <div className="w-full h-screen flex items-center justify-start">
      <div className="w-1/2 hidden lgl:inline-flex h-full text-white">
        <div className="w-[450px] h-full bg-primeColor px-10 flex flex-col gap-6 justify-center">
          <Link to="/">
            <img src={logoLight} alt="logoImg" className="w-28" />
          </Link>
          <div className="flex flex-col gap-1 -mt-1">
            <h1 className="font-titleFont text-xl font-medium">
              Get started for free
            </h1>
            <p className="text-base">Create your account to access more</p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1">
              <BsCheckCircleFill />
            </span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Get started fast with OREBI
              </span>
              <br />
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab omnis
              nisi dolor recusandae consectetur!
            </p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1">
              <BsCheckCircleFill />
            </span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Access all OREBI services
              </span>
              <br />
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab omnis
              nisi dolor recusandae consectetur!
            </p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1">
              <BsCheckCircleFill />
            </span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Trusted by online Shoppers
              </span>
              <br />
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab omnis
              nisi dolor recusandae consectetur!
            </p>
          </div>
          <div className="flex items-center justify-between mt-10">
            <p className="text-sm font-titleFont font-semibold text-gray-300 hover:text-white cursor-pointer duration-300">
              © OREBI
            </p>
            <p className="text-sm font-titleFont font-semibold text-gray-300 hover:text-white cursor-pointer duration-300">
              Terms
            </p>
            <p className="text-sm font-titleFont font-semibold text-gray-300 hover:text-white cursor-pointer duration-300">
              Privacy
            </p>
            <p className="text-sm font-titleFont font-semibold text-gray-400 hover:text-white cursor-pointer duration-300">
              Security
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lgl:w-[500px] h-full flex flex-col justify-center">
        {successMsg ? (
          <div className="w-[500px]">
            <p className="w-full px-4 py-10 text-green-500 font-medium font-titleFont">
              {successMsg}
            </p>
            <Link to="/signin">
              <button
                className="w-full h-10 bg-primeColor rounded-md text-gray-200 text-base font-titleFont font-semibold 
            tracking-wide hover:bg-black hover:text-white duration-300"
              >
                Sign in
              </button>
            </Link>
          </div>
        ) : (
          <form className="w-full lgl:w-[500px] h-screen flex items-center justify-center">
            <div className="px-6 py-4 w-full h-[96%] flex flex-col justify-start overflow-y-scroll scrollbar-thin scrollbar-thumb-primeColor">
              <h1 className="font-titleFont underline underline-offset-4 decoration-[1px] font-semibold text-2xl mdl:text-3xl mb-4">
                Create your account
              </h1>
              <div className="flex flex-col gap-3">
                {/* Client Name */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Full Name
                  </p>
                  <input
                    onChange={handleName}
                    value={clientName}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="text"
                    placeholder="eg. John Doe"
                  />
                  {isValidationError && JSON.parse(errorMsg).clientName && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).clientName}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Work Email
                  </p>
                  <input
                    onChange={handleEmail}
                    value={email}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="email"
                    placeholder="john@workemail.com"
                  />
                  {isValidationError && JSON.parse(errorMsg).email && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).email}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Phone Number */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Phone Number
                  </p>
                  <input
                    onChange={handlePhone}
                    value={phone}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="text"
                    placeholder="008801234567891"
                  />
                  {isValidationError && JSON.parse(errorMsg).phone && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).phone}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Password */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Password
                  </p>
                  <input
                    onChange={handlePassword}
                    value={password}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="password"
                    placeholder="Create password"
                  />
                  {isValidationError && JSON.parse(errorMsg).password && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).password}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Address */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Address
                  </p>
                  <input
                    onChange={handleAddress}
                    value={address}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="text"
                    placeholder="road-001, house-115, example area"
                  />
                  {isValidationError && JSON.parse(errorMsg).address && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).address}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* City */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    City
                  </p>
                  <input
                    onChange={handleCity}
                    value={city}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="text"
                    placeholder="Your city"
                  />
                  {isValidationError && JSON.parse(errorMsg).city && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).city}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Country */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Country
                  </p>
                  <input
                    onChange={handleCountry}
                    value={country}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="text"
                    placeholder="Your country"
                  />
                  {isValidationError && JSON.parse(errorMsg).country && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).country}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Zip code */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Zip/Postal code
                  </p>
                  <input
                    onChange={handleZip}
                    value={zip}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="text"
                    placeholder="Your zipcode"
                  />
                  {isValidationError && JSON.parse(errorMsg).zip && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {JSON.parse(errorMsg).zip}
                    </p>
                  )}
                  {!isValidationError && errorMsg && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      {errorMsg}
                    </p>
                  )}
                </div>
                {/* Checkbox */}
                <div className="flex items-start mdl:items-center gap-2">
                  <input
                    onChange={handleChecked}
                    checked={checked}
                    className="w-4 h-4 mt-1 mdl:mt-0 cursor-pointer"
                    type="checkbox"
                  />
                  <p className="text-sm text-primeColor">
                    I agree to the OREBI{" "}
                    <span className="text-blue-500">Terms of Service </span>and{" "}
                    <span className="text-blue-500">Privacy Policy</span>.
                  </p>
                </div>
                <button
                  onClick={handleSignUp}
                  className={`${
                    checked && !loading
                      ? "bg-primeColor hover:bg-black hover:text-white cursor-pointer"
                      : "bg-gray-500 hover:bg-gray-500 hover:text-gray-200 cursor-not-allowed"
                  } w-full text-gray-200 text-base font-medium h-10 rounded-md hover:text-white duration-300`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Create Account"}
                </button>
                <p className="text-sm text-center font-titleFont font-medium">
                  Don't have an Account?{" "}
                  <Link to="/signin">
                    <span className="hover:text-blue-600 duration-300">
                      Sign in
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
