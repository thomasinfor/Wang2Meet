"use client"
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Chip from '@mui/material/Chip';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from "@/context/Auth";

export default function Navbar() {
  const { user, signIn, logOut, updateUser } = useAuth();
  const router = useRouter();
  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: '5px' }}>
        <IconButton size="large" color="inherit" onClick={() => router.push("/")}>
          <HomeIcon />
        </IconButton>
        <IconButton size="large" color="inherit" onClick={() => navigator.clipboard.writeText(window.location.href)}>
          <ShareIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        </Typography>
        {user && <Chip sx={{ maxWidth: '190px' }} label={user.displayName} icon={<EditIcon/>} onClick={async () => {
          try {
            const name = window.prompt("New name:");
            if (!name) return;
            if (name.length === 0)
              return window.alert("Can't set empty name");
            const res = await updateUser({
              displayName: name.trim()
            });
          } catch(e) {
            console.error(e);
            window.alert("Update failed");
          }
        }}/>}
        <IconButton size="large" color="inherit" onClick={() => {
          if (!user) {
            signIn();
          } else {
            if (window.confirm("Sign out?"))
              logOut();
          }
        }}>
          {user ? <Avatar src={user.photoURL} sx={{ width: 24, height: 24 }}/> : <AccountCircle />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
