"use client"
import { useState, useEffect, useMemo, useCallback, useContext, createContext } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import { useTheme } from '@mui/material/styles';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";
import BaseGrid from "@/components/BaseGrid";
import { inRange, pad, Time, dayOfWeek, colorScale, tableMap } from "@/utils";

const Context = createContext(false);

function Grid({ ...p }) {
  // const theme = useTheme();
  const { focus, level } = useContext(Context);
  const style = {};
  if (level[p.i][p.j] !== null)
    Object.assign(style, { background: colorScale('#339900', level[p.i][p.j]) });
  if (focus && p.i == focus[0] && p.j == focus[1])
    Object.assign(style, { border: '1px solid red' });
  return (
    <BaseGrid {...p} style={style}/>
  );
}

export default function ViewTimeTable({
  value, focus: p_focus, setFocus: p_setFocus=()=>{},
  time, date, duration,
}) {
  const EMPTY_TABLE = useMemo(() => new Array(time[1] - time[0]).fill(0).map(() => new Array(duration).fill(false)), [time, duration]);
  const [_focus, _setFocus] = useState(null);
  const setFocus = useCallback((...x) => { _setFocus(...x); p_setFocus(...x); }, [_setFocus, p_setFocus]);
  useEffect(() => { if (p_focus !== undefined) _setFocus(p_focus) }, [p_focus]);
  const focus = useMemo(() => p_focus === undefined ? _focus : p_focus, [p_focus, _focus]);

  const enter = useCallback((i, j) => {
    setFocus([i, j]);
  }, [setFocus]);
  const up = useCallback((i=false, j=false) => {
    if (i === false || j === false)
      setFocus(null);
  }, [setFocus]);

  const totalPeople = useMemo(() => Object.keys(value).length, [value]);
  const available = useMemo(() => tableMap(EMPTY_TABLE, (_, i, j) =>
      Object.entries(value).filter(([k, v]) => v[i][j]).map(e => e[0])), [value, EMPTY_TABLE]);
  const maxPeople = useMemo(() => available.flat().reduce((a, c) => Math.max(a, c.length), 0), [available]);
  const level = useMemo(() => tableMap(available, e => maxPeople === 0 ? null : e.length / maxPeople), [available, maxPeople]);

  return (
    <Context.Provider value={{ focus, available, level }}>
      <TimeTable
        enter={enter}
        down={enter}
        up={up}
        leave={() => setFocus(null)}
        Grid={Grid}
        time={time}
        date={date}
        duration={duration}
      />
    </Context.Provider>
  );
}

