import { createContext, useContext, useState, useEffect } from "react";
//api
import {
  getProfileRequest,
  getUsersRequest,
  updateAvatarRequest,
  updateUserRequest,
} from "../api/userApi.js";
//context
import { useAuth } from "./AuthContext";

export const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used withing a UserProvider");
  return context;
};

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [httpError, setHttpError] = useState(null);

  //context
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn){
      setUser(null);
      setAvatar(null);
    };
  }, [isLoggedIn]);

  //limpia httpError
  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => setHttpError(null), 4000);
    return () => clearTimeout(timeout);
  }, [httpError]);

  async function getUserProfile() {
    try {
      setLoading(true);
      const res = await getProfileRequest();
      if (res.status === 200) {
        setUser(res.data);
        if (res.data.avatar) setAvatar(res.data.avatar);
        return setLoading(false);
      }
    } catch (error) {
      setHttpError(error.response.data[0]);
      return setLoading(false);
    }
  }

  //get users
  async function getUsers() {
    try {
      const res = await getUsersRequest();
      if (res.status === 200) {
        setUsers(res.data);
        return setLoading(false);
      }
    } catch (error) {
      setHttpError(error.response.data[0]);
      return setLoading(false);
    }
  }

  //updateUser
  async function updateUser(user) {
    try{
      setLoading(true);
      const res = await updateUserRequest(user);
      if(res.status === 200){
        setUser(res.data);
        setLoading(false);
        return "ok";
      }
    }catch(error){
      setHttpError(error.response.data[0]);
      return setLoading(false);
    }
  }

  //update avatar
  async function updataUsersAvatar(userAvatar){
    try {
      setLoading(true);
      const res = await updateAvatarRequest(userAvatar);
      if(res.status === 200){
        setAvatar(res.data);
        return setLoading(false)
      }
    } catch (error) {
      console.log(error)
      setHttpError(error.response.data[0])
      return setLoading(false);
    }
  }

  ////set avatar from children
  async function handleSetAvatar(userAvatar) {
    return setAvatar(userAvatar)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        users,
        avatar,
        loading,
        httpError,
        getUserProfile,
        getUsers,
        updateUser,
        updataUsersAvatar,
        handleSetAvatar,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
