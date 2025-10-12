import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => ({
  clients: [],
  bankTerminals: []
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
    resetAll: () => getInitialState(), // nueva referencia para evitar mutaciones previas
  },
});

export const { setClientsList, setTerminals, resetAll } = clientsSlice.actions;
export default clientsSlice.reducer;
