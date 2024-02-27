"use client"
import { useState, useEffect, useMemo, useCallback, useContext, createContext } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import { useTheme } from '@mui/material/styles';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";
import BaseGrid from "@/components/BaseGrid";
import { inRange, pad, Time, dayOfWeek, colorScale, tableMap, defaultTime, defaultDate, defaultDuration } from "@/utils";

const Context = createContext(false);

function Grid({ ...p }) {
  const { newTable, covered } = useContext(Context);
  return (
    <BaseGrid {...p} className={[
      newTable(p.i, p.j) ? "on" : "",
      covered(p.i, p.j) ? "covered" : "",
    ].join(' ')}/>
  );
}

export default function EditTimeTable({
  value: _value, setValue,
  time=defaultTime, date=defaultDate, duration=defaultDuration,
  disabled=false,
  defaultTable=null,
}) {
  const EMPTY_TABLE = useMemo(() => new Array(time[1] - time[0]).fill(0).map(() => new Array(duration).fill(false)), [time, duration]);
  useEffect(() => {
    if (defaultTable)
      setValue(defaultTable, false);
    else
      setValue(EMPTY_TABLE, false);
  }, [defaultTable]);
  const value = _value || EMPTY_TABLE;

  const [sel, setSel] = useState(null);
  const covered = useCallback((i, j) => sel && inRange(i, sel[0][0], sel[1][0]) && inRange(j, sel[0][1], sel[1][1]), [sel]);
  const newTable = useCallback((i, j) => covered(i, j) ? !value[sel[0][0]][sel[0][1]] : value[i][j], [sel, value, covered]);
  const up = useCallback(() => {
    if (sel) {
      const res = tableMap(EMPTY_TABLE, (e, i, j) => newTable(i, j));
      setValue(res);
    }
    setSel(null);
  }, [sel, setSel, newTable]);
  const down = useCallback((i, j) => {
    // console.log("down", i, j);
    setSel([[i, j], [i, j]]);
  }, [setSel]);
  const enter = useCallback((i, j) => {
    // console.log("enter", i, j);
    setSel(sel => sel && [sel[0], [i, j]]);
  }, [setSel]);

  return (
    <Context.Provider value={{ newTable, covered }}>
      <TimeTable
        up={up}
        down={down}
        enter={enter}
        Grid={Grid}
        time={time}
        date={date}
        duration={duration}
        disabled={disabled}
      />
    </Context.Provider>
  );
}

