"use client"
import { useState } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Chip from '@mui/material/Chip';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";

const Indicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  outline: 2px solid lightgreen;
  border-radius: 50%;
  z-index: 3;
  transition: all 0.5s linear;
`;

export default function Navbar() {
  const { user, signIn, logOut, updateUser } = useAuth();
  const { indicator } = useStatus();
  const router = useRouter();

  return (
    <AppBar position="relative">
      <Toolbar variant="dense" sx={{ gap: '5px', height: '56px' }}>
        <IconButton size="large" color="inherit" onClick={() => router.push("/")}>
          <HomeIcon />
        </IconButton>
        <IconButton size="large" color="inherit" onClick={() => navigator.clipboard.writeText(window.location.href)}>
          <ShareIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        </Typography>
        {user && <Chip sx={{ maxWidth: '150px' }} label={user.displayName} icon={<PermIdentityIcon/>} onClick={() => router.push("/me")}/>}
        <IconButton size="large" color="inherit" onClick={() => {
          if (!user) {
            signIn();
          } else {
            router.push("/me");
          }
        }}>
          {user ? <Avatar src={user.photoURL} sx={{ width: 24, height: 24 }}/> : <AccountCircle />}
        </IconButton>
      </Toolbar>
      {indicator !== false && (
        Number(indicator) === indicator ? <Indicator style={{ width: `${indicator * 100}%` }}/>
        : <Indicator style={{ background: indicator }}/>
      )}
    </AppBar>
  );
}
