"use client"
import React from "react";
import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import styled from "@emotion/styled";
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { interpret, slotBefore } from "@/utils";
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
const TableWrapper = styled.div`
  max-width: 100%;
  max-height: 95vh;
`;
const SmallMenuItem = styled(MenuItem)(() => ({
  minHeight: 0,
  maxWidth: '100%',
  alignItems: 'baseline',
  "& > span": {
    color: '#888',
    fontSize: 'x-small',
  },
}));

export default function MeetView() {
  const { config } = useConfig();
  const SP = useSearchParams();
  const highlight = useMemo(() => {
    let lst = (SP.get("range") || "").split(",").map(e => parseInt(e));
    if (lst.length !== 4 || lst.some(e => isNaN(e) || e < 0 || e >= 96))
      return false;
    const res = [[lst[0], lst[1]], [lst[2], lst[3]]];
    if (!slotBefore(...res))
      return false;
    return res;
  }, [SP]);

  const [viewGroup, setViewGroup] = useState(true);
  const [viewFocus, setViewFocus] = useState([0, 0]);
  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);

  return (
    <>
      <Typography variant="h5" sx={{
        overflow: "auto",
        maxWidth: "100%",
        padding: "5px 10px",
        boxSizing: "border-box",
      }}>{config.title}</Typography>
      <div style={{ maxWidth: '100%', margin: '0 10px' }}>
        <FormControl sx={{ p: 1, maxWidth: '100%', minWidth: 120, boxSizing: 'border-box' }} size="small">
          <InputLabel>Target</InputLabel>
          <Select
            value={viewGroup}
            label="Target"
            onChange={e => setViewGroup(e.target.value)}
            sx={{ "& .MuiSelect-select > span": { display: 'none' } }}
          >
            <SmallMenuItem value={true}>
              <em>ALL</em>
            </SmallMenuItem>
            {Object.entries(config.collection).map(([k, v]) =>
              <SmallMenuItem value={k} key={k}>
                {v.name}<span>&nbsp;&nbsp;{k}</span>
              </SmallMenuItem>)}
          </Select>
        </FormControl>
      </div>
      {viewGroup === true && viewFocus &&
        <AvailableList
          list={getAvailable(viewFocus)}
          time={interpret(config.date, config.time[0], viewFocus)}
          style={{ position: 'sticky', top: '5px', zIndex: 10, pointerEvents: 'none', opacity: 0.6, margin: '0 10px' }}
        />}
      <Tables>
        <Container>
          <TableWrapper className="constrained">
            <ViewTimeTable
              keepFocus
              value={viewGroup === true ? config.collection
                : { [viewGroup]: config.collection[viewGroup] }}
              time={config.time}
              date={config.date}
              duration={config.duration}
              focus={viewFocus}
              setFocus={setViewFocus}
              highlightRange={highlight}
            />
          </TableWrapper>
        </Container>
      </Tables>
    </>
  );
}

