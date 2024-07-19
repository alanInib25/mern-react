//react-router-dom
import { NavLink } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
function Header() {
  //context
  const { isLoggedIn } = useAuth();
  const { user } = useUser();
  return (
    <header className="container">
      <nav className="p-1">
        {isLoggedIn ? (
          <ul className="d-flex j-content">
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <NavLink to="/signout">Signout</NavLink>
            </li>
            <li>
              <h2>{`Hy, ${user && user.name}`}</h2>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/signup">Signup</NavLink>
            </li>
            <li>
              <NavLink to="/signin">Signin</NavLink>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}

export default Header;
