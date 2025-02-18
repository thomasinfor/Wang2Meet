"use client"
import React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/context/Auth";
import { useConfig } from "./MeetPanel";

export default function MeetDefault() {
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useConfig();
  const { user } = useAuth();
  useEffect(() => {
    if (config?.collection[user?.email])
      router.replace(`${pathname}/view`);
    else
      router.replace(`${pathname}/edit`);
  }, [pathname, router]);
  return <></>;
}

