import api from "./api";

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post("/auth/login", {
      username: identifier,
      password,
    });
    return response.data; // { access_token, token_type }
  },

  register: async (identifier, password) => {
    const response = await api.post("/auth/register", {
      username: identifier,
      email: identifier,
      password,
    });
    return response.data; // UserResponse
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data; // { message }
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return response.data; // { message }
  },
};