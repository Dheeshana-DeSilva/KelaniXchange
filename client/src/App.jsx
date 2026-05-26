import { useLocation } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import MarketplaceNavbar from "./components/layout/MarketplaceNavbar";
import Footer from "./components/layout/Footer";

const AUTH_ROUTES = ["/login", "/register"];
const MARKETPLACE_FLOW_PREFIXES = [
  "/marketplace",
  "/listings",
  "/cart",
  "/checkout",
  "/orders",
  "/sales",
  "/exchanges",
  "/wishlist",
  "/users",
  "/profile",
];

function App() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const isMarketplaceFlow = MARKETPLACE_FLOW_PREFIXES.some((path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAuthPage && !isAdmin && (isMarketplaceFlow ? <MarketplaceNavbar /> : <Navbar />)}
      <AppRoutes />
      {!isAuthPage && !isAdmin && <Footer />}
    </>
  );
}

export default App;
