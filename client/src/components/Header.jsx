import { useState } from "react";
//react-router-dom
import { NavLink, Link } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
//react-icons
import { IoLogoWechat } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
//env
const API_URL = import.meta.env.VITE_API_URL;

function Header() {
  const [seeMenu, setSeeMenu] = useState(
    window.innerWidth > 768 ? true : false
  );
  //context
  const { isLoggedIn } = useAuth();
  const { user, avatar } = useUser();

  function handleClickNav() {
    if (window.innerWidth > 768) return setSeeMenu(true);
    return setSeeMenu(false);
  }

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-logo" data-cy="nav-logo">
            <Link to="/">
              <IoLogoWechat />
              People's
            </Link>
          </div>
          {isLoggedIn && seeMenu && (
            <>
              <ul className="nav-menu" data-cy="nav-menu">
                <li className="nav-menu__item">
                  <NavLink to="/dashboard" onClick={handleClickNav}>
                    <FaHome />
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-menu__item">
                  <NavLink to="/profile" onClick={handleClickNav}>
                  <FaUser />
                    Profile
                  </NavLink>
                </li>
                <li className="nav-menu__item">
                  <NavLink to="/signout" onClick={handleClickNav}>
                  <FaSignOutAlt />
                    Signout
                  </NavLink>
                </li>
                <li className="nav-menu__item">
                  {user && (
                    <Link className="link-profile" to="/profile">
                      <div className="nav-row">
                        <picture className="nav-avatar">
                          <img src={`${API_URL}/uploads/${avatar}`} />
                        </picture>
                        <h2>{`@${user.name}`}</h2>
                      </div>
                    </Link>
                  )}
                </li>
              </ul>
            </>
          )}
          {!isLoggedIn && seeMenu && (
            <ul className="nav-menu" data-cy="nav-menu">
              <li className="nav-menu__item">
                <Link to="/" onClick={handleClickNav} data-cy="nav-menu-home">
                  <FaHome />
                  Home
                </Link>
              </li>
              <li className="nav-menu__item">
                <Link
                  className="link signup"
                  to="/signup"
                  onClick={handleClickNav}
                  data-cy="nav-menu-signup"
                >
                  Signup
                </Link>
              </li>
              <li className="nav-menu__item">
                <Link
                  className="link signin"
                  to="/signin"
                  onClick={handleClickNav}
                  data-cy="nav-menu-signin"
                >
                  Signin
                </Link>
              </li>
            </ul>
          )}
          <button className="nav-toggle" onClick={() => setSeeMenu(!seeMenu)} data-cy="toggle-button">
            {seeMenu ? <IoMdClose /> : <IoMenu />}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
