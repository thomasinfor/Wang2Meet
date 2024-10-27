"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { Roboto_Mono } from "next/font/google";
import { Time, dayOfWeek, defaultTime, defaultDate, defaultDuration } from "@/utils";

const roboto_mono = Roboto_Mono({ subsets: ["latin"] });

const Table = styled.table`
  border-spacing: 0;
  user-select: none;
  text-align: center;
  table-layout: fixed;
  & td {
    width: 50px;
    min-width: 45px;
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
  background: #fff;
  font-size: 11px;
  left: 0;
  z-index: 1;
`;
const DateCell = styled.td`
  & > span {
    font-size: x-small;
  }
  line-height: 100%;
  white-space: pre;
  padding: 3% 5px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
`;
const Container = styled.div`
`;

export default function TimeTable({
  up=()=>{}, down=()=>{}, enter=()=>{}, leave=()=>{}, click=()=>{},
  time=defaultTime, date=defaultDate, duration=defaultDuration,
  Grid, corner=null,
  disabled=false, hideDate=false, ...props
}) {
  const [randomID, setRandomID] = useState(0);
  useEffect(() => { setRandomID(parseInt(Math.random() * 1e8)); }, []);

  const ROW = useMemo(() => new Array(time[1] - time[0]).fill(time[0]).map((e, i) => e + i), [time]);
  const dates = useMemo(() => new Array(duration).fill(0).map((e, i) => new Date(date[0], date[1]-1, date[2]+i)), [date, duration]);
  const COL = useMemo(() => new Array(duration).fill(new Date(date[0], date[1]-1, date[2]).getDay()).map((e, i) => e + i - 1), [date, duration]);

  useEffect(() => {
    function touchMove(e) {
      const theTouch = e.changedTouches[0];
      const element = document.elementFromPoint(theTouch.clientX, theTouch.clientY);
      // console.log(element);
      try {
        const idx = element.id.split("-").map(e => parseInt(e));
        if (idx[2] === randomID && idx.length == 3) {
          enter(idx[0], idx[1]);
        }
      } catch(e) {
        // empty
      }
    }
    function touchEnd(e) {
      const theTouch = e.type === "touchend" ? e.changedTouches[0] :
                       e.type === "mouseup" ? e : {};
      const element = document.elementFromPoint(theTouch.clientX, theTouch.clientY);
      // console.log(element);
      try {
        const idx = element.id.split("-").map(e => parseInt(e));
        if (idx[2] === randomID && idx.length == 3) {
          return up(idx[0], idx[1]);
        }
      } catch(e) {
        // empty
      }
      up();
    }
    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchend", touchEnd);
    document.addEventListener("mouseup", touchEnd);
    return () => {
      document.removeEventListener("touchmove", touchMove);
      document.removeEventListener("touchend", touchEnd);
      document.removeEventListener("mouseup", touchEnd);
    };
  }, [enter, up, randomID]);

  return (
    <Container {...props} className={roboto_mono.className}>
      <Table onDragStart={e => e.preventDefault()} className={disabled ? "disabled" : ""}>
        <tbody>
          <tr>
            <td>{corner}</td>
            {dates.map((date, j) =>
              <DateCell key={j}>
                {hideDate || <span>{date.getMonth()+1}/{date.getDate()}{"\n"}</span>}
                {dayOfWeek[(date.getDay()) % 7]}
              </DateCell>)}
          </tr>
          {ROW.map((time, i) =>
            <tr key={i}>
              <TimeTd>
                {new Time(time).section === 0 && new Time(time).timeStr}
              </TimeTd>
              {COL.map((day, j) =>
                <Grid
                  key={j}
                  id={`${i}-${j}-${randomID}`}
                  {...{ i, j, time, date, down, enter, leave, click }}
                />)}
            </tr>)}
          <tr>
            <TimeTd>
              {new Time(ROW[ROW.length-1]+1).section === 0 && new Time(ROW[ROW.length-1]+1).timeStr}
            </TimeTd>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}
