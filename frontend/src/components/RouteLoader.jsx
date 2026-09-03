import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageLoader from "./PageLoader";

const RouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 200); // loader duration (ms)

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return loading ? <PageLoader /> : null;
};

export default RouteLoader;
