"use client"
import React from "react";
import { useContext, createContext, useState } from 'react';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

const StatusContext = createContext({});

export const StatusContextProvider = ({ children }) => {
  const [indicator, setIndicator] = useState(false);

  return (
    <DialogsProvider>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}/>
      <StatusContext.Provider value={{
        indicator, setIndicator,
        message: (...x) => enqueueSnackbar(...x)
      }}>
        {children}
      </StatusContext.Provider>
    </DialogsProvider>
  );
};

export const useStatus = () => {
  return useContext(StatusContext);
};
