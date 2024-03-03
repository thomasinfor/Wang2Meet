"use client"
import { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

const StatusContext = createContext({});

export const StatusContextProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [indicator, setIndicator] = useState(false);

  return (
    <SnackbarProvider maxSnack={3}>
      <StatusContext.Provider value={{
        indicator, setIndicator,
        message: enqueueSnackbar
      }}>
        {children}
      </StatusContext.Provider>
    </SnackbarProvider>
  );
};

export const useStatus = () => {
  return useContext(StatusContext);
};
