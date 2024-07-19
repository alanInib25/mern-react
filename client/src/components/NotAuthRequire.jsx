//react-router-dom
import { Navigate, Outlet } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";

function NotAuthRequire(){
  //context
  const { isLoggedIn } = useAuth();

  if(isLoggedIn) return <Navigate to="/dashboard" replace/>

  return(
    <Outlet />
  )
}

export default NotAuthRequire;