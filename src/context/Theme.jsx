"use client"
import React from "react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocalStorageState } from '@toolpad/core';
import { useAuth } from "@/context/Auth";
import { STORAGE_KEY } from '@/utils';

const defaultTheme = '#66aaaa';

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

export function DefaultTheme({ children }) {
  return (
    <ThemeProvider theme={makeTheme(defaultTheme)}>
      {children}
    </ThemeProvider>
  );
}

export default function Theme({ children }) {
  const { request, user } = useAuth();
  const [localTheme, setLocalTheme] = useLocalStorageState(
    STORAGE_KEY`theme`,
    defaultTheme,
    useMemo(() => ({
      codec: {
        parse: theme => theme && /^#[\da-f]{6}$/.test(theme) ? theme : null,
        stringify: theme => theme
      }
    }), [])
  );
  const [theme, _setTheme] = useState(defaultTheme);
  useEffect(() => {
    if (localTheme) _setTheme(localTheme)
  }, [localTheme, _setTheme]);
  const setTheme = useCallback(theme => {
    setLocalTheme(theme);
    _setTheme(theme);
   }, [setLocalTheme, _setTheme]);

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