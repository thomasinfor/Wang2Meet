"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import { useTheme } from '@mui/material/styles';
import Linear from "@/components/Linear";
import { inRange, pad, Time, dayOfWeek, colorScale } from "@/utils";

const GridElement = styled.td`
  background: #DDD;
  touch-action: pan-down;
  border: 1px solid black;
  &.on {
    background: #66aaaa;
  }
  &.covered {
    border-width: 0;
  }
`;
const Table = styled.table`
  border-spacing: 0;
  user-select: none;
  text-align: center;
  & td {
    width: 50px;
    height: 10px;
    box-sizing: border-box;
  }
  &.disabled {
    filter: blur(2px);
    pointer-events: none;
  }
`;
const TimeTd = styled.td`
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateY(-50%);
  font-size: smaller;
  position: sticky;
  left: 0;
`;
const DateCell = styled.td`
  & > span {
    font-size: x-small;
  }
  line-height: 100%;
  white-space: pre;
  padding: 5px;
`;


function Grid({ time, id, down=()=>{}, enter=()=>{}, on=false, covered=false, view=false, UID="" }) {
  const theme = useTheme();
  return (
    <GridElement
      id={`${id}-${UID}`}
      onPointerDown={down}
      onMouseEnter={enter}
      className={[!view && on && "on", !view && covered && "covered"].filter(e => e).join(' ')}
      style={{ ...[
        { borderBottom: 'none' },
        { borderTop: 'none', borderBottomStyle: 'dotted' },
        { borderTop: 'none', borderBottom: 'none' },
        { borderTop: 'none' },
      ][time.section], backgroundColor: view ? colorScale('#339900' || theme.palette.primary.main, view) : undefined }}
    >
    </GridElement>
  );
}

const defaultTime = [0, 48];
const defaultDate = [2024, 6, 1];
export default function TimeTable({
  time=defaultTime,
  date=defaultDate,
  duration=5,
  confirm=()=>{},
  disabled=false,
  defaultTable=null,
  view=false,
}) {
  const viewMode = view !== false;
  const maxPeople = useMemo(() => view && new Set(view.flat().flat()).size, [view]);

  const [randomID, setRandomID] = useState(0);
  useEffect(() => { setRandomID(parseInt(Math.random() * 1e8)); }, []);
  const [sel, setSel] = useState(null);
  const [on, setOn] = useState(defaultTable);
  useEffect(() => {
    if (defaultTable)
      setOn(defaultTable);
    else
      setOn(new Array(time[1] - time[0]).fill(0).map(() => new Array(duration).fill(false)));
  }, [time, duration, setOn, defaultTable]);

  const ROW = useMemo(() => new Array(time[1] - time[0]).fill(time[0]).map((e, i) => e + i), [time]);
  const dates = useMemo(() => new Array(duration).fill(0).map((e, i) => new Date(date[0], date[1]-1, date[2]+i)), [date, duration]);
  const COL = useMemo(() => new Array(duration).fill(new Date(date[0], date[1]-1, date[2]).getDay()).map((e, i) => e + i - 1), [date, duration]);

  const covered = useCallback((i, j) => sel && inRange(i, sel[0][0], sel[1][0]) && inRange(j, sel[0][1], sel[1][1]), [sel]);
  const modified = useCallback((i, j) => covered(i, j) ? !on[sel[0][0]][sel[0][1]] : on[i][j], [sel, on, covered]);

  const up = useCallback(() => {
    // console.log("up", sel);
    if (sel && !viewMode){
      setOn(o => {
        const res = o.map((row, i) => row.map((e, j) => modified(i, j)));
        confirm(res);
        return res;
      });
    }
    setSel(null);
  }, [sel, setSel, setOn, modified]);
  const down = useCallback((i, j) => {
    // console.log("down", i, j);
    setSel([[i, j], [i, j]]);
  }, [setSel]);
  const enter = useCallback((i, j) => {
    // console.log("enter", i, j);
    setSel(sel => sel && [sel[0], [i, j]]);
  }, [setSel]);

  useEffect(() => {
    function touch(e) {
      const theTouch = e.changedTouches[0];
      const element = document.elementFromPoint(theTouch.clientX, theTouch.clientY);
      // console.log(element);
      try {
        const idx = element.id.split("-").map(e => parseInt(e));
        if (idx[2] === randomID && idx.length == 3) {
          enter(idx[0], idx[1]);
        }
      } catch(e) {}
    }
    document.addEventListener("touchmove", touch);
    document.addEventListener("touchend", up);
    return () => {
      document.removeEventListener("touchmove", touch);
      document.removeEventListener("touchend", up);
    };
  }, [enter, up, randomID]);
  useEffect(() => {
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, [up]);

  if (!(on && on.length === time[1]-time[0] && on[0].length === duration))
    return "";

  return (
    <Table onDragStart={e => e.preventDefault()} className={disabled ? "disabled" : ""}>
      <tbody>
        <tr>
          <td></td>
          {dates.map((date, j) =>
            <DateCell key={j}>
              <span>{date.getMonth()+1}/{date.getDate()}</span>
              {"\n"}{dayOfWeek[(date.getDay()) % 7]}
            </DateCell>)}
        </tr>
        {ROW.map((time, i) =>
          <tr key={i}>
            <TimeTd>
              {new Time(time, 0).section === 0 && new Time(time, 0).timeStr}
            </TimeTd>
            {COL.map((day, j) =>
              <Grid
                view={viewMode && (maxPeople === 0 ? 0 : view[i][j].length / maxPeople)}
                key={j} time={new Time(time, day)}
                id={`${i}-${j}`}
                UID={randomID}
                down={() => down(i, j)}
                enter={() => enter(i, j)}
                on={viewMode ? on[i][j] : modified(i, j)}
                covered={!viewMode && covered(i, j)}
              />)}
          </tr>)}
        <tr>
          <TimeTd>
            {new Time(ROW[ROW.length-1]+1, 0).section === 0 && new Time(ROW[ROW.length-1]+1, 0).timeStr}
          </TimeTd>
        </tr>
      </tbody>
    </Table>
  );
}
