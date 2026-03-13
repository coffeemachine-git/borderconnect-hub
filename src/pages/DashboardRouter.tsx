import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import BorderSecurityDashboard from "./BorderSecurityDashboard";
import HumanitarianDashboard from "./HumanitarianDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "border_security") return <BorderSecurityDashboard />;
  return <HumanitarianDashboard />;
}
