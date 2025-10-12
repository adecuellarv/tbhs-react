import axios from "axios";
import { api } from "./common"

export const getServices = async () => {
  const { data } = await api.get("/apis/servicios/servicios/getServices");
  return data;
};