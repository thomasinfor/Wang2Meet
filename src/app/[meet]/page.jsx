"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";

export default function Meet({ params }) {
  const [config, setConfig] = useState(null);
  const [name, setName] = useState("");
  useEffect(() => {
    (async () => {
      // let res = await fetch(`${params.meet}`);
      let res = await {
        time: [0, 96],
        date: [2024, 2, 24],
        duration: 8,
        title: "Let's meet"
      };
      setConfig(res);
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

