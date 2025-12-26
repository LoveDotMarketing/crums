import { useParams, Navigate } from "react-router-dom";
import { getLocationBySlug } from "@/lib/locations";
import LocationPageTemplate from "@/components/LocationPageTemplate";

const CityLocationPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  
  if (!citySlug) {
    return <Navigate to="/locations" replace />;
  }
  
  const location = getLocationBySlug(citySlug);
  
  if (!location) {
    return <Navigate to="/locations" replace />;
  }
  
  return <LocationPageTemplate location={location} />;
};

export default CityLocationPage;
