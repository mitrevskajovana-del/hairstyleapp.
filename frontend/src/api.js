import axios from "axios";

const API = axios.create({
  baseURL: "https://hairlux-backend-rfh0.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const uploadHairstyleImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await API.post(
    "/uploads/hairstyle",
    formData
  );

  return response.data;
};

export default API;