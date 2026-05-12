import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import { useLocation } from "react-router";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      {isHomePage && (
        <div className="fixed top-0 left-0 z-50 w-full">
          <Navbar />
        </div>
      )}

      {!isHomePage && <Navbar />}

      <AppRoutes />
    </>
  );
}

export default App;