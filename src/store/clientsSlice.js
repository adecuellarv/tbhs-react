import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => ({
  clients: [],
  bankTerminals: [],
  employees: [],
  events: [],
  event: {},
  dateCalendar: {},
  openModalEdit: false
});

const clientsSlice = createSlice({
  name: 'clients',
  initialState: getInitialState(),
  reducers: {
    setClientsList: (state, action) => {
      state.clients = action.payload;
    },
    setTerminals: (state, action) => {
      state.bankTerminals = action.payload;
    },
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    setEvent: (state, action) => {
      state.event = action.payload;
    },
    setDateCalendar: (state, action) => {
      state.dateCalendar = action.payload;
    },
    setOpenModalEdit: (state, action) => {
      state.openModalEdit = action.payload;
    },
    resetAll: () => getInitialState(), // nueva referencia para evitar mutaciones previas
  },
});

export const { setClientsList, setTerminals, setEmployees, resetAll, setEvent, setDateCalendar, setOpenModalEdit, setEvents } = clientsSlice.actions;
export default clientsSlice.reducer;
