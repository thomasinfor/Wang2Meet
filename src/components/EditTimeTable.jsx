"use client"
import React from "react";
import { useState, useEffect, useMemo, useCallback, useContext, createContext } from "react";
import TimeTable from "@/components/TimeTable";
import BaseGrid from "@/components/BaseGrid";
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { inRange, tableMap, defaultTime, defaultDate, defaultDuration } from "@/utils";

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
  bufferTime=false, alarm=()=>{},
  defaultTable=null, ...props
}) {
  // const { setIndicator } = useStatus();
  const [synced, setSynced] = useState(1);
  const EMPTY_TABLE = useMemo(() => new Array(time[1] - time[0]).fill(0).map(() => new Array(duration).fill(false)), [time, duration]);
  useEffect(() => {
    if (defaultTable)
      setValue(defaultTable, false);
    else
      setValue(EMPTY_TABLE, false);
  }, [defaultTable, EMPTY_TABLE, setValue]);
  const value = _value || EMPTY_TABLE;

  const [sel, setSel] = useState(null);
  const covered = useCallback((i, j) => sel && inRange(i, sel[0][0], sel[1][0]) && inRange(j, sel[0][1], sel[1][1]), [sel]);
  const newTable = useCallback((i, j) => covered(i, j) ? !value[sel[0][0]][sel[0][1]] : value[i][j], [sel, value, covered]);
  const up = useCallback(() => {
    if (sel) {
      const res = tableMap(EMPTY_TABLE, (e, i, j) => newTable(i, j));
      setValue(res);
      if (bufferTime) {
        const t = new Date().getTime();
        setCD([t, t + 1000 * bufferTime]);
        setSynced(0);
      }
    }
    setSel(null);
  }, [sel, setSel, newTable, bufferTime, EMPTY_TABLE, setValue]);
  const down = useCallback((i, j) => {
    // console.log("down", i, j);
    setSel([[i, j], [i, j]]);
  }, [setSel]);
  const enter = useCallback((i, j) => {
    // console.log("enter", i, j);
    setSel(sel => sel && [sel[0], [i, j]]);
  }, [setSel]);

  const [, setCD] = useState(null); // [now, ddl]
  useEffect(() => {
    if (bufferTime) {
      const id = setInterval(() => {
        setCD(e => {
          if (!e || e[0] === e[1]) return e;
          const now = Math.min(new Date().getTime(), e[1]);
          if (now === e[1]) {
            (async () => {
              setSynced((await alarm()) ? 1 : -1);
            })();
          }
          return [now, e[1]];
        })
      }, 10);
      return () => clearInterval(id);
    }
  }, [bufferTime, alarm, setCD]);
  // useEffect(() => {
  //   setIndicator(CD === null ? 1 : 1 - ((CD[1] - CD[0]) / bufferTime / 1000));
  // }, [CD]);

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
        corner={bufferTime ? (
          synced === 1 ? <CheckIcon sx={{ fontSize: 15 }} color="primary"/> :
          synced === -1 ? <CloseIcon sx={{ fontSize: 15 }} color="error"/> :
          <CircularProgress size={15}/>) : null}
        {...props}
      />
    </Context.Provider>
  );
}

