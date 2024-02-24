"use client"
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function Navbar() {
  const router = useRouter();
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton size="large" color="inherit" onClick={() => { router.push("/") }}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          W2M
        </Typography>
        <IconButton size="large" color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
