// admin/src/services/auth.ts
import api from "../configs/api";

export const Register = async (userData: {
  email: string;
  password: string;
  name: string;
  phone_number: string;
  address: string;
}) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (userData: { email: string; password: string }) => {
  try {
    const response = await api.post("/users/login", userData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
