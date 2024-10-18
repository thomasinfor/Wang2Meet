"use client"
import React from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/Auth";
import Chip from '@mui/material/Chip';
import GoogleIcon from '@mui/icons-material/Google';
import Linear from "@/components/Linear";

export default function SignInPage() {
  const router = useRouter();
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user === false) return;
    if (user) {
      router.replace("/");
    } else {
      signIn();
    }
  }, [user, signIn, router]);

  return (
    <main>
      <Linear style={{ minHeight: 'calc(100vh - 56px)' }}>
        <Chip
          icon={<GoogleIcon/>}
          label="Sign in with Google account"
          variant="contained"
          color="primary"
          onClick={signIn}
        />
      </Linear>
    </main>
  );
}

