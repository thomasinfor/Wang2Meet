"use client"
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { dump, parse, interpret, defaultTime, defaultDate, tableMap, cast } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";
import { useConfig } from "../layout";

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
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  border: 1px dashed black;
  border-radius: 5px;
`;
const SplitViewContainer = styled(Container)`
  width: 45%;
  @media (max-width: 700px) {
    width: 100%;
    &.view {
      display: none;
    }
  }
`;
const TableWrapper = styled.div`
  max-width: 100%;
  max-height: 95vh;
`;

export default function MeetEdit({ params }) {
  const { config, setConfig } = useConfig();
  const { user, request, signIn } = useAuth();
  const { message } = useStatus();
  const [table, setTable] = useState(null);
  const [focus, setFocus] = useState(null);

  const update = useCallback(async (tbl, is_new=true) => {
    setTable(tbl);
    if (is_new) {
      setConfig(c => ({ ...c, collection: { ...c.collection, [user.email]: { ...c.collection[user.email], table: tbl } } }));
    }
    return tbl;
  }, [setTable, user, setConfig]);

  const sync = useCallback(async (t) => {
    const time = dump(t || table);
    let res = await request('POST', `/api/${params.meet}`, {
      body: { time }
    });
    if (!res.ok) {
      return false;
    } else {
      res = await res.json();
      setConfig(cfg => {
        const new_col = {};
        for (let i in res.collection)
          new_col[i] = {
            ...res.collection[i],
            table: i === user.email ? cfg.collection[user.email].table : parse(res.collection[i].table)
          };
        return { ...res, collection: new_col };
      });
      return true;
    }
  }, [user, request, table, params.meet, setConfig]);

  const pasteSchedule = useCallback(async () => {
    if (!user || !table) return;
    try {
      let res = await request('GET', `/api/me`);
      if (res.ok) {
        res = await res.json();
        if (res.table) {
          res = parse(res.table);
          const t = cast(res, defaultDate, defaultTime, config.date, config.time, config.duration);
          await sync(await update(tableMap(table, (e, i, j) => e || t[i][j])));
          message("Schedule pasted", { variant: "success" });
        } else {
          message("Default schedule not set", { variant: "error" });
        }
      } else {
        window.alert("Operation failed");
      }
    } catch(e) {
      console.error(e);
      window.alert("Operation failed");
    }
  }, [user, table, config, update, request, sync, message]);

  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);

  const refs0 = useRef(null), refs1 = useRef(null);
  const refs = [refs0, refs1];
  function syncScroll(i) {
    return {
      ref: refs[i],
      onScroll: scroll => {
        if (refs[1-i].current) {
          refs[1-i].current.scrollTop = scroll.target.scrollTop;
          refs[1-i].current.scrollLeft = scroll.target.scrollLeft;
        }
      }
    }
  }
  useEffect(() => {
    if (!focus) {
      if (refs0.current && refs1.current) {
        refs0.current.scrollTop = refs1.current.scrollTop;
        refs0.current.scrollLeft = refs1.current.scrollLeft;
      }
    }
  }, [focus, refs0, refs1]);

  return (
    <>
      <Typography variant="h5" sx={{
        overflow: "auto",
        maxWidth: "100%",
        padding: "5px 10px",
        boxSizing: "border-box",
      }}>{config.title}</Typography>
      {config.description &&
        <Typography variant="p" sx={{
          overflow: "auto",
          maxWidth: "100%",
          boxSizing: "border-box",
          whiteSpace: "pre-line",
        }}>{config.description}</Typography>}
      {Boolean(user) || <Alert severity="info" onClick={signIn} sx={{ cursor: 'pointer' }}>Sign in to continue</Alert>}
      <Stack direction="row" spacing={2}>
        {user &&
          <Chip
            icon={<ContentPasteGoIcon/>}
            label="Paste my schedule"
            variant="contained"
            color="primary"
            onClick={async () => {
              if (window.confirm("Confirm to paste default schedule?")) {
                await pasteSchedule();
              }
            }}
          />}
        <Chip
          icon={<RestartAltIcon/>}
          label="Clear"
          variant="contained"
          color="primary"
          onClick={async () => {
            if (window.confirm("Confirm to clear schedule?")) {
              await sync(await update(tableMap(table, () => false)));
              message("Schedule cleared", { variant: "success" });
            }
          }}
        />
      </Stack>
      <Tables>
        <SplitViewContainer style={{ display: focus === null ? 'none' : undefined }}>
          {focus &&
            <AvailableList
              time={interpret(config.date, config.time[0], focus)}
              list={getAvailable(focus)}
              style={{ paddingTop: '30px' }}
            />}
        </SplitViewContainer>
        <SplitViewContainer {...syncScroll(0)} style={{ display: focus !== null ? 'none' : undefined }}>
          <TableWrapper>
            <EditTimeTable
              defaultTable={config.collection[user?.email]?.table || null}
              disabled={!user}
              time={config.time}
              date={config.date}
              duration={config.duration}
              value={table}
              setValue={update}
              bufferTime={1}
              alarm={sync}
            />
          </TableWrapper>
        </SplitViewContainer>
        <SplitViewContainer className="view" {...syncScroll(1)}>
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
        </SplitViewContainer>
      </Tables>
    </>
  );
}

