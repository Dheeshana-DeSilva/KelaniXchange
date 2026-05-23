import { useLocation } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import MarketplaceNavbar from "./components/layout/MarketplaceNavbar";
import Footer from "./components/layout/Footer";

const AUTH_ROUTES = ["/login", "/register"];

function App() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const isMarketplace = location.pathname.startsWith("/marketplace");
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAuthPage && !isAdmin && (isMarketplace ? <MarketplaceNavbar /> : <Navbar />)}
      <AppRoutes />
      {!isAuthPage && !isAdmin && <Footer />}
    </>
  );
}

export default App;