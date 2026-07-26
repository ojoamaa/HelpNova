import api from "./api";

export async function loginUser(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    return data;
}