"use client"
import React from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/Auth";
import CircularProgress from '@mui/material/CircularProgress';
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
        <CircularProgress size={25}/>
      </Linear>
    </main>
  );
}

