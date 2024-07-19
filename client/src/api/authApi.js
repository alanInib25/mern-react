import axios from "./axios";

export const signupUserRequest = (user) => axios.post("/auth/signup", user);
export const signinUserRequest = (credentials) => axios.post("/auth/signin", credentials);
export const signoutUserRequest = () => axios.get("/auth/signout");
export const checkSigninRequest = () => axios.get("/auth/signin-check");
export const forgotPasswordRequest = (email) => axios.post("/auth/forgot-password", email);
export const resetPasswordRequest = (credentials, token) => axios.post(`/auth/reset-password/${token}`, credentials)
