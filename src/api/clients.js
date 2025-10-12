import { api } from "./common"

export const getClients = async () => {
  try {
    const resp = await api.get(`/apis/clientes/clientes/getClients`);
    if (resp?.data) return resp?.data;
  } catch (error) {
    return;
  }
}

export const createClient = async (data) => {
  try {
    const resp = await api.post(`/apis/clientes/clientes/createClient`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch (error) {
    return;
  }
}