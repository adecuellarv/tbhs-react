import { api } from "./common"

export const getEmployees = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/getEmployees`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch  {
    return;
  }
}

export const getAppoinments = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/getAppoinments`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch  {
    return;
  }
}

export const getSchedule = async () => {
  try {
    const resp = await api.get(`/apis/agenda/agenda/getSchedule`, { withCredentials: true });
    if (resp?.data) return resp?.data;
  } catch  {
    return;
  }
}

export const setAppoiment = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/agendarMultiple`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch  {
    return;
  }
}

export const deleteApointment = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/deleteApointment`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch  {
    return;
  }
}

export const deleteAdvance = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/deleteAdvance`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch  {
    return;
  }
}

export const getBankTerminals = async () => {
  try {
    const resp = await api.get(`/apis/agenda/agenda/getBankTerminals`);
    if (resp?.data) return resp?.data;
  } catch {
    return;
  }
}

export const updateAppointment = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/updateAppointment`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch {
    return;
  }
}

export const editAppointmentFull = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/editar`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch {
    return;
  }
}

export const addAdvancePayment = async (data) => {
  try {
    const resp = await api.post(`/apis/agenda/agenda/addAdvancePayment`, data, {
      headers: { "Content-Type": "application/json" }
    });
    if (resp?.data) return resp?.data;
  } catch {

    return;
  }
}

