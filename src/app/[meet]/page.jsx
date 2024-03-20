"use client"
import React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';

export default function MeetDefault() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    router.replace(`${pathname}/edit`);
  }, [pathname, router]);
  return <></>;
}

