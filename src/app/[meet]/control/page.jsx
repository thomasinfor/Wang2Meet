"use client"
import React from "react";
import { useState, useCallback, useMemo } from "react";
import Image from 'next/image';
import styled from "@emotion/styled";
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { interpret, slotBefore, getCalendarLink } from "@/utils";
import { useConfig } from "../MeetPanel";

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
const TableWrapper = styled.div`
  max-width: 100%;
  max-height: 95vh;
`;

function timeStr(time) {
  return `${time.month}/${time.date} ${time.dow} ${time.hourPad}:${time.minutePad}`;
}

export default function MeetControl() {
  const { config } = useConfig();
  const interp = useCallback(t => interpret(config.date, config.time[0], t), [config]);
  const [viewFocus, setViewFocus] = useState([0, 0]);
  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);

  const [listen, setListen] = useState(null);
  const [range, setRange] = useState([null, null]);
  const [start, end] = useMemo(() => range, [range]);

  const onGridClick = useCallback((...slot) => {
    if (listen === "start") {
      setRange(r => r[1] ? slotBefore(slot, r[1]) ? [slot, r[1]] : [r[1], slot] : [slot, null]);
      setListen(null);
    }
    if (listen === "end") {
      setRange(r => r[0] ? slotBefore(slot, r[0]) ? [slot, r[0]] : [r[0], slot] : [null, slot]);
      setListen(null);
    }
  }, [listen, setRange]);

  return (
    <>
      <Typography variant="h5" sx={{
        overflow: "auto",
        maxWidth: "100%",
        padding: "5px 10px",
        boxSizing: "border-box",
      }}>Settle up</Typography>
      {viewFocus &&
        <AvailableList
          list={getAvailable(viewFocus)}
          time={interp(viewFocus)}
          style={{ position: 'sticky', top: '5px', zIndex: 10, pointerEvents: 'none', opacity: 0.6, margin: '0 10px' }}
        />}
      <Stack direction="row" spacing={2}>
        <Chip
          sx={{ minWidth: "150px" }}
          label={start ? timeStr(interp(start)) : listen === "start" ? "Picking..." : "Pick start"}
          variant="contained"
          color="primary"
          onClick={() => {
            if (start) {
              setRange(r => [null, r[1]]);
              setListen("start");
            } else {
              setListen(l => l === "start" ? null : "start");
            }
          }}
        />
        <Chip
          sx={{ minWidth: "150px" }}
          label={end ? timeStr(interp(end).next()) : listen === "end" ? "Picking..." : "Pick end"}
          variant="contained"
          color="primary"
          onClick={() => {
            if (end) {
              setRange(r => [r[0], null]);
              setListen("end");
            } else {
              setListen(l => l === "end" ? null : "end");
            }
          }}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <Chip
          icon={
            <Image
              width="24" height="24" alt="Google Calendar Icon"
              src={`https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_${start ? interp(start).date : 31}_2x.png`}
            />
          }
          label="Create Google Calendar event"
          variant="contained"
          disabled={!start || !end}
          color="primary"
          onClick={() => window.open(getCalendarLink(config, interp(start), interp(end)))}
        />
      </Stack>
      <Tables>
        <Container>
          <TableWrapper className="constrained">
            <ViewTimeTable
              keepFocus
              value={config.collection}
              time={config.time}
              date={config.date}
              duration={config.duration}
              focus={viewFocus}
              setFocus={setViewFocus}
              click={onGridClick}
              highlightRange={(start || end) && [start || end, end || start]}
              mask={config.mask}
            />
          </TableWrapper>
        </Container>
      </Tables>
    </>
  );
}

