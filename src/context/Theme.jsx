"use client"
import React from "react";
import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from "@/context/Auth";

const defaultTheme = '#66aaaa';
function makeTheme(theme) {
  return createTheme({
    palette: {
      primary: {
        main: theme,
      }
    }
  });
}

export default function Theme({ children }) {
  const { request, user } = useAuth();
  const [theme, setTheme] = useState(defaultTheme);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user) (async () => {
      let res = await request('GET', `/api/me`);
      if (res.ok) {
        res = await res.json();
        console.log(res);
        if (res.theme) {
          setTheme(res.theme);
        } else {
          setTheme(defaultTheme);
        }
      }
    })().finally(() => setLoaded(true));
    else {
      setTheme('#66aaaa');
      if (user !== false)
        setLoaded(true);
    }
  }, [request, user]);

  if (!loaded) return;
  return (
    <ThemeProvider theme={makeTheme(theme)}>
      {children}
    </ThemeProvider>
  );
}