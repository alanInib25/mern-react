import axios from "./axios";

export const getProfileRequest = () => axios.get("/users/profile");
export const getUsersRequest = () => axios.get("/users");
export const updateAvatarRequest = (avatar) => axios.post("/users/avatar", avatar);
export const updateUserRequest = (user) => axios.patch("/users/update", user);