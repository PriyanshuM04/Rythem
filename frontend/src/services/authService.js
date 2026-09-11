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
      password,
    });
    return response.data; // UserResponse
  },
};