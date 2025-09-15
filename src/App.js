import React, { Component, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { PermissionProvider } from "./components/PermissionProvider";
import Footer from "./components/home/Footer/Footer";
import FooterBottom from "./components/home/Footer/FooterBottom";
import Header from "./components/home/Header/Header";
import HeaderBottom from "./components/home/Header/HeaderBottom";
import SpecialCase from "./components/SpecialCase/SpecialCase";
import About from "./pages/About/About";
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import Cart from "./pages/Cart/Cart";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Journal from "./pages/Journal/Journal";
import Offer from "./pages/Offer/Offer";
import Payment from "./pages/payment/Payment";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Shop from "./pages/Shop/Shop";
import {
  PaymentSuccess,
  PaymentCancel,
  PaymentError,
} from "./pages/PaymentResult";
import Profile from "./pages/Profile/Profile"; // Added Profile component

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h2 className="text-2xl font-semibold text-black mb-2">
            Something went wrong.
          </h2>
          <p className="text-base text-gray-600 mb-4">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Layout = () => {
  const loginState = useSelector((state) => state.login);
  useEffect(() => {
    console.log("Rehydrated login state:", loginState);
  }, [loginState]);

  return (
    <div>
      <Header />
      <HeaderBottom />
      <SpecialCase />
      <Outlet />
      <Footer />
      <FooterBottom />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <ErrorBoundary>
          <Layout />
        </ErrorBoundary>
      }
    >
      <Route index element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/offer" element={<Offer />} />
      <Route path="/product/:_id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/paymentgateway" element={<Payment />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      <Route path="/payment/error" element={<PaymentError />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/profile" element={<Profile />} />{" "}
      {/* Added Profile route */}
    </Route>
  )
);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PermissionProvider>
          <div className="font-bodyFont">
            <RouterProvider router={router} />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </PermissionProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
