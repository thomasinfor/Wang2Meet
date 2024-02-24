"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";
import { dump, parse } from "@/utils";

const Tables = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100vw;
  gap: 20px;
  flex-wrap: wrap;
  overflow: auto;
  padding: 0 10px;
  box-sizing: border-box;
`;
const Container = styled.div`
  max-width: 45%;
  overflow: auto;
  box-sizing: border-box;
  @media (max-width: 700px) {
    max-width: 100%;
  }
`;

export default function Meet({ params }) {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const countTable = useMemo(() => !config ? false :
    new Array(config.time[1] - config.time[0]).fill(0).map((_, i) => new Array(config.duration).fill(0).map((_, j) =>
      Object.entries(config.collection).filter(([k, v]) => v[i][j]).map(e => e[0]))), [config]);

  const [name, setName] = useState("");
  useEffect(() => {
    (async () => {
      let res = await fetch(`/api/${params.meet}`);
      if (res.ok) {
        res = await res.json();
        for (let i in res.collection)
          res.collection[i] = parse(res.collection[i]);
        setConfig(res);
      } else {
        router.push("/");
      }
    })();
  }, [params.meet]);

  async function confirm(table) {
    table = dump(table);
    let res = await fetch(`/api/${params.meet}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, time: table
      })
    });
    if (!res.ok) {
      window.alert("更新失敗");
    } else {
      // updated
    }
  }

  return (
    <main>
      {config &&
        <Linear style={{ minHeight: '100vh' }}>
          <h3>{config.title}</h3>
          <TextField autoFocus label="Name" variant="outlined" value={name} onChange={e => setName(e.target.value)}/>
          <Tables>
            <Container>
              <TimeTable
                defaultTable={config.collection[name] || null}
                disabled={name.length === 0}
                time={config.time}
                date={config.date}
                duration={config.duration}
                confirm={confirm}
              />
            </Container>
            <Container>
              <TimeTable
                view={countTable}
                time={config.time}
                date={config.date}
                duration={config.duration}
              />
            </Container>
          </Tables>
        </Linear>}
    </main>
  );
}

