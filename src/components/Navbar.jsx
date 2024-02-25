"use client"
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from "@/context/Auth";

export default function Navbar() {
  const { user, signIn, logOut } = useAuth();
  const router = useRouter();
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton size="large" color="inherit" onClick={() => router.push("/")}>
          <HomeIcon />
        </IconButton>
        <IconButton size="large" color="inherit" onClick={() => navigator.clipboard.writeText(window.location.href)}>
          <ShareIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          
        </Typography>
        <IconButton size="large" color="inherit" onClick={() => {
          if (!user) {
            signIn();
          } else {
            logOut();
          }
        }}>
          {user ? <Avatar src={user.photoURL} sx={{ width: 24, height: 24 }}/> : <AccountCircle />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
