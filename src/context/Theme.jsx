"use client"
import React from "react";
import { useState, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from "@/context/Auth";

const STORAGE_KEY = 'Wang2Meet_theme';
const defaultColor = '#66aaaa';
const defaultTheme = (() => {
  try {
    const theme = window.localStorage.getItem(STORAGE_KEY);
    if (theme && /^#[\da-f]{6}$/.test(theme))
      return theme;
    return defaultColor;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultColor;
  }
})();

function makeTheme(themeColor) {
  let theme = createTheme({
    palette: {
      primary: {
        main: themeColor,
      },
    }
  });
  return createTheme(theme, {
    palette: {
      green: theme.palette.augmentColor({
        color: {
          main: '#339900',
          contrastText: "#000",
        },
        name: 'green',
      }),
      purple: theme.palette.augmentColor({
        color: {
          main: '#9366aa',
          contrastText: "#000",
        },
        name: 'purple',
      }),
    }
  });
}

export default function Theme({ children }) {
  const { request, user } = useAuth();
  const [theme, _setTheme] = useState(defaultTheme);
  const setTheme = useCallback(t => {
    _setTheme(t);
    if (window.localStorage) {
      window.localStorage.setItem("Wang2Meet_theme", t);
    }
  }, [_setTheme]);
  const [loaded, setLoaded] = useState(Boolean(window?.localStorage));

  useEffect(() => {
    if (user) (async () => {
      let res = await request('GET', `/api/me`);
      if (res.ok) {
        res = await res.json();
        if (res.theme) {
          setTheme(res.theme);
        } else {
          setTheme(defaultTheme);
        }
      }
    })().finally(() => setLoaded(true));
    else if (user !== false) {
      setLoaded(true);
    }
  }, [request, user, setTheme]);

  if (!loaded) return;
  return (
    <ThemeProvider theme={makeTheme(theme)}>
      {children}
    </ThemeProvider>
  );
}