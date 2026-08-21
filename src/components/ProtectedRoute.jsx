import { Navigate } from "react-router-dom";

const authStorageKey = "roshanCards.authUser";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem(authStorageKey);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;