import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './clientsSlice';

export const store = configureStore({
  reducer: {
    appointment: clientsReducer,
  },
});
