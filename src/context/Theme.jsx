"use client"
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#66aaaa',
      light: '#84bbbb',
      dark: '#477676',
      contrastText: '#000000',
    }
  }
});

export default function Theme({ children }) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}