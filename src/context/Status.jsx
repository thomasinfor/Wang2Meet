"use client"
import { useContext, createContext, useState, useEffect, useCallback } from 'react';

const StatusContext = createContext({});

export const StatusContextProvider = ({ children }) => {
  const [indicator, setIndicator] = useState(false);

  return (
    <StatusContext.Provider value={{
      indicator, setIndicator
    }}>
     {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  return useContext(StatusContext);
};
