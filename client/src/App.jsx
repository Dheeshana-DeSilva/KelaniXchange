import { useLocation } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

const AUTH_ROUTES = ["/login", "/register"];

function App() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <AppRoutes />
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;