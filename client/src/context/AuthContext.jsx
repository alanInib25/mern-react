import { createContext, useContext, useState, useEffect } from "react";
//api
import {
  signupUserRequest,
  signinUserRequest,
  signoutUserRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  checkSigninRequest,
} from "../api/authApi.js";
//js-cookie
import Cookies from "js-cookie";

//crea contexto
export const AuthContext = createContext();

//uso de contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used withing a AuthProvider");
  return context;
};

//Provider
function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [httpError, setHttpError] = useState(null);

  useEffect(() => {
    checkSignin();
  }, []);

  //checksingin
  useEffect(() => {
    let interval;
    if (isLoggedIn) {
      interval = setInterval(() => checkSignin(), 10000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn]);
  //limpia error
  useEffect(() => {
    const timeout = setTimeout(() => setHttpError(null), 5000);
    return () => clearTimeout(timeout);
  }, [httpError]);

  //signup user
  async function signupUser(user) {
    try {
      setLoading(true);
      const res = await signupUserRequest(user);
      if (res.status === 200) {
        setLoading(false);
        return "ok";
      };
    } catch (error) {
      setHttpError(error.response.data[0]);
      return setLoading(false);
    }
  }
  ///signin user
  async function signinUser(credentials) {
    try {
      const res = await signinUserRequest(credentials);
      if (res.status === 200) {
        setIsLoggedIn(true);
        return setLoading(false);
      }
    } catch (error) {
      setHttpError(error.response.data[0]);
      return setLoading(false);
    }
  }
  //signout
  async function signoutUser() {
    try {
      setLoading(true);
      const res = await signoutUserRequest();
      if (res.status === 200) {
        setIsLoggedIn(false);
        Cookies.remove("accessToken");
        return setLoading(false);
      }
    } catch (error) {
      return setHttpError(error.response.data[0]);
    }
  }
  //checksignin
  async function checkSignin() {
    try {
      const cookie = Cookies.get();
      if (!cookie.accessToken) return setIsLoggedIn(false);
      const res = await checkSigninRequest();
      if (res.status === 200) {
        return setIsLoggedIn(true);
      }
    } catch (error) {
      return setHttpError(error.message);
    }
  }

  //forgot password
  async function userForgotPassword(email) {
    try {
      setLoading(false);
      const res = await forgotPasswordRequest(email);
      if (res.status === 200){
        setLoading(true);
        return "ok";
      };
    } catch (error) {
      return setHttpError(error.response.data[0]);
    }
  }

  //reset password
  async function userResetPassword(credentials, token){
    try{
      const res = await resetPasswordRequest(credentials, token);
      console.log(res);
      if(res.status === 200){
        setLoading(false);
        return "ok";
      };
    }catch(error){
      setHttpError(error.response.data[0]);
      return setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        httpError,
        signupUser,
        signinUser,
        signoutUser,
        userForgotPassword,
        userResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
