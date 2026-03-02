import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import Customers from "./pages/Tables/Customers";
import Orders from "./pages/Tables/Orders";
import Barcode from "./pages/Tables/Barcode";
import Subscription from "./pages/Tables/Subscription";
import Payments from "./pages/Tables/Payments";
import Invoice from "./pages/Tables/Invoice";
import Document from "./pages/Tables/Document";
import Recurring from "./pages/Tables/Recurring";
import Repair from "./pages/Tables/Repair";
import Track from "./pages/Tables/Track";
import Complaint from "./pages/Tables/Complaint";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Product from "./pages/Tables/Product";
import RentalHistoryTable from "./pages/Tables/RentHistoryTable";
import InvoiceDetail from "./components/tables/InvoiceDetail";
import ProtectedRoute from "./components/protected/ProtectedRoutes";
import Defaulters from "./pages/Tables/Defaulters";
import CustomersDashboard from "./pages/Dashboard/CustomersDashboard";
import OrdersDashboard from "./pages/Dashboard/OrdersDashboard";
import ProductsDashboard from "./pages/Dashboard/ProductsDashboard";
import BillingDashboard from "./pages/Dashboard/BillingDashboard";
import AllProduct from "./pages/Tables/AllProduct";
import ProductBarcode from "./pages/Tables/ProductBarcode";
import ProductBarcodeDetails from "./pages/Tables/ProductBarcodeDetails";
import Package from "./pages/Tables/Package";
import Refunds from "./pages/Tables/Refunds";
import CustomerDetails from "./pages/Tables/CustomerDetails";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "customer manager",
                    "Order manager",
                    "Product manager",
                    "Finance manager",
                  ]}
                >
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "customer manager"]}>
                  <CustomersDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "Order manager"]}>
                  <OrdersDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <ProductsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "Finance manager"]}>
                  <BillingDashboard />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={["admin", "customer manager"]}>
                  <Customers allowedRoles={["admin", "customer manager"]} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:customerId"
              element={
                <ProtectedRoute allowedRoles={["admin", "customer manager"]}>
                  <CustomerDetails allowedRoles={["admin", "customer manager"]} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/defaulters"
              element={
                <ProtectedRoute allowedRoles={["admin", "customer manager"]}>
                  <Defaulters allowedRoles={["admin", "customer manager"]} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["admin", "Order manager"]}>
                  <Orders allowedRoles={["admin", "Order manager"]} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/refunds"
              element={
                <ProtectedRoute allowedRoles={["admin", "Order manager"]}>
                  <Refunds allowedRoles={["admin", "Order manager"]} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/barcode"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <Barcode />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <Product />
                </ProtectedRoute>
              }
            />

            <Route
              path="/allproducts"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <AllProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/packages"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <Package />
                </ProtectedRoute>
              }
            />
            <Route
              path="/allproducts/:productId"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <ProductBarcode />
                </ProtectedRoute>
              }
            />
            <Route
              path="/barcodes/:barcodeId"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <ProductBarcodeDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute allowedRoles={["admin", "Order manager"]}>
                  <Subscription allowedRoles={["admin", "Order manager"]} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={["admin", "Finance manager"]}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice"
              element={
                <ProtectedRoute allowedRoles={["admin", "Finance manager"]}>
                  <Invoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "Finance manager"]}>
                  <InvoiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute allowedRoles={["admin", "Finance manager"]}>
                  <Document />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recurring"
              element={
                <ProtectedRoute allowedRoles={["admin", "Order manager"]}>
                  <Recurring />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repair"
              element={
                <ProtectedRoute allowedRoles={["admin", "Order manager"]}>
                  <Repair />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track"
              element={
                <ProtectedRoute allowedRoles={["admin", "Product manager"]}>
                  <Track />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute allowedRoles={["admin", "customer manager"]}>
                  <Complaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rent-history"
              element={
                <ProtectedRoute allowedRoles={["admin", "customer manager"]}>
                  <RentalHistoryTable />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
