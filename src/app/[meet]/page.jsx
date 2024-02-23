"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";

export default function Meet({ params }) {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [name, setName] = useState("");
  useEffect(() => {
    (async () => {
      let res = await fetch(`/api/${params.meet}`);
      if (res.ok) {
        res = await res.json();
        setConfig(res);
      } else {
        router.push("/");
      }
    })();
  }, [params.meet]);

  async function confirm(table) {
    fetch = console.log;
    let res = await fetch(`${params.meet}`, {
      body: JSON.stringify({
        name, time: table
      })
    });
  }

  return (
    <main>
      {config &&
        <Linear style={{ minHeight: '100vh' }}>
          <h3>{config.title}</h3>
          <TextField autoFocus label="Name" variant="outlined" value={name} onChange={e => setName(e.target.value)}/>
          <TimeTable
            disabled={name.length === 0}
            time={config.time}
            date={config.date}
            duration={config.duration}
            confirm={confirm}
          />
        </Linear>}
    </main>
  );
}

