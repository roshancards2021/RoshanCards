import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../app/App.jsx'
import '../styles/index.css'
import '../styles/media-query.css'
import Login from '../pages/Login.jsx'
import Catalouge from '../pages/Catalouge.jsx'
import ManageProducts from '../pages/ManageProducts.jsx'
import ManageUsers from '../pages/ManageUsers.jsx'
import ManageContactInfo from '../pages/ManageContactInfo.jsx'
import ManageSliderContent from '../pages/ManageSliderContent.jsx'
import NewProduct from '../pages/NewProduct.jsx'
import ContactRequests from '../pages/ContactRequests.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProductDetails from '../pages/ProductDetails.jsx'
import SingleProduct from '../pages/SingleProduct.jsx'
import AboutUs from '../components/AboutUs.jsx'
import ProtectedRoute from "../components/ProtectedRoute";
import { HelmetProvider } from 'react-helmet-async'
import FileNotFound from '../pages/FileNotFound.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/home",
    element: <App />
  },
  {
    path: "/catalogue",
    element: <Catalouge />
  },
  {
    path: "/manage-users",
    element: (
      <ProtectedRoute>
        <ManageUsers />
      </ProtectedRoute>
    )
  },
  {
    path: "/manage-products",
    element: (
      <ProtectedRoute>
        <ManageProducts />
      </ProtectedRoute>
  )
  },
  {
    path: "/manage-contact-info",
    element:(
      <ProtectedRoute>
        <ManageContactInfo />
      </ProtectedRoute>
    )
  },
  {
    path: "/manage-slider-content",
    element:(
      <ProtectedRoute>
        <ManageSliderContent />
        </ProtectedRoute>
    )
  },
  {
    path: "/contact-requests",
    element: (
      <ProtectedRoute>
        <ContactRequests />
      </ProtectedRoute>
    )
  },
  {
    path: "/new-product",
    element: (
      <ProtectedRoute>
        <NewProduct />
      </ProtectedRoute>
    )
  },
  {
    path: "/product-details",
    element: (
      <ProtectedRoute>
        <ProductDetails />
      </ProtectedRoute>
    )
  },
  {
    path: "/product/:productId",
    element: <SingleProduct />
  },
  {
    path: "*",
    element: <FileNotFound />
  }
]);

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);
