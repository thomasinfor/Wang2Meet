"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Linear from "@/components/Linear";
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import { dump, parse } from "@/utils";
import { useAuth } from "@/context/Auth";

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
  width: 45%;
  overflow: auto;
  box-sizing: border-box;
  @media (max-width: 700px) {
    width: 100%;
    height: 40vh;
  }
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
const AvailableListContainer = styled(Linear)`
  padding-top: 30px;
  min-height: 160px;
  box-sizing: border-box;
  justify-content: flex-start;
`;
const TableWrapper = styled.div`
  max-width: 100%;
`;

function AvailableList({ list=[] }) {
  return (
    <AvailableListContainer>
      <div>
        Available ({list.filter(e => e[1]).length}):
      </div>
      <div>
        {list.filter(e => e[1]).map(e => e[0]).join()}&nbsp;
      </div>
      <div>
        &nbsp;
      </div>
      <div>
        Unavailable ({list.filter(e => !e[1]).length}):
      </div>
      <div>
        {list.filter(e => !e[1]).map(e => e[0]).join()}&nbsp;
      </div>
    </AvailableListContainer>
  );
}

export default function Meet({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [table, setTable] = useState(null);
  const [focus, setFocus] = useState(null);
  const name = useMemo(() => user ? user.displayName : "", [user]);

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

  const update = useCallback(async (tbl, is_new=true) => {
    setTable(tbl);
    if (!tbl || !is_new) return;
    const time = dump(tbl);
    let res = await fetch(`/api/${params.meet}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, time
      })
    });
    if (!res.ok) {
      window.alert("更新失敗");
    } else {
      res = await res.json();
      for (let i in res.collection)
          res.collection[i] = i === name ? tbl : parse(res.collection[i]);
      setConfig(res);
    }
  }, [setTable, name]);

  return (
    <main>
      {config &&
        <Linear style={{ minHeight: '100vh', gap: '10px' }}>
          <h3>{config.title}</h3>
          {name.length === 0 &&
            <Alert severity="info">Sign in to continue</Alert>}
          <Tables>
            <Container>
              {focus !== null
                ? <AvailableList list={Object.entries(config.collection).map(([k, v]) => [k, v[focus[0]][focus[1]]])}/>
                : <TableWrapper>
                    <EditTimeTable
                      defaultTable={config.collection[name] || null}
                      disabled={name.length === 0}
                      time={config.time}
                      date={config.date}
                      duration={config.duration}
                      value={table}
                      setValue={update}
                    />
                  </TableWrapper>}
            </Container>
            <Container>
              <TableWrapper>
                <ViewTimeTable
                  value={config.collection}
                  time={config.time}
                  date={config.date}
                  duration={config.duration}
                  focus={focus}
                  setFocus={setFocus}
                />
              </TableWrapper>
            </Container>
          </Tables>
        </Linear>}
    </main>
  );
}

