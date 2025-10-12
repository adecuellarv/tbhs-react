// clients.js
import { api } from "./common"

export const getClients = async () => {
  try {
    const resp = await api.get('apis/clientes/clientes/getClients');
    return resp?.data;
  } catch { return; }
}

export const createClient = async (data) => {
  try {
    const resp = await api.post('apis/clientes/clientes/createClient', data, {
      headers: { "Content-Type": "application/json" }
    });
    return resp?.data;
  } catch { return; }
}
