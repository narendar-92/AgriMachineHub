import { Navigate } from "react-router-dom";

export default function ProtectedOwnerRoute({ children }) {
  const token = localStorage.getItem("ownerToken");
  if (!token) {
    return <Navigate to="/owner-login" replace />;
  }
  return children;
}
