import { api } from "./api";

export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  return data;
}
