//react-router-dom
import { Outlet, Navigate } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";

function AuthRequire() {
  //context
  const { isLoggedIn } = useAuth();
  if(!isLoggedIn) return <Navigate to="/signin" replace />
  return(
    <Outlet />
  )
}

export default AuthRequire;