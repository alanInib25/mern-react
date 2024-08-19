//react-router-dom
import { BrowserRouter, Routes, Route } from "react-router-dom";
//context
import AuthProvider from "./src/context/AuthContext";
import UserProvider from "./src/context/UserContext";
//componets
import Layout from "./src/components/Layout";
import AuthRequire from "./src/components/AuthRequire";
import NotAuthRequire from "./src/components/NotAuthRequire";
import Signout from "./src/components/Signout";
//pages (components)
import Home from "./src/pages/Home";
import Profile from "./src/pages/Profile";
import ErrorPage from "./src/pages/ErrorPage";
import Dashboard from "./src/pages/Dashboard";
import ForgotPassword from "./src/pages/ForgotPassword";
import ResetPassword from "./src/pages/ResetPassword";
import SigninUser from "./src/pages/SigninUser";
import SignupUser from "./src/pages/SignupUser";

//styles
import "./src/scss/styles.scss";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route element={<NotAuthRequire />}>
                <Route index element={<Home />} />
                <Route path="/signup" element={<SignupUser />} />
                <Route path="/signin" element={<SigninUser />} />
             {/*    <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
                /> */}
                <Route path="/reset-password/:forgotToken" element={<ResetPassword />}/>
              </Route>
              <Route element={<AuthRequire />}>
                <Route path="/signout" element={<Signout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
