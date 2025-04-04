"use client"
import React, { useRef } from "react";
import { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { Roboto_Mono } from "next/font/google";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from "@mui/material/IconButton";
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
  transform: translate(-1px, -50%);
  font-size: smaller;
  position: sticky;
  background: #fff;
  font-size: 11px;
  left: 0;
  z-index: 2;
`;
const DateCell = styled.td`
  & > span {
    font-size: x-small;
  }
  line-height: 100%;
  white-space: pre;
  padding: 3vh 5px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
`;
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
const TableCtrlFull = styled.div`
  position: absolute;
  z-index: 3;
  & {
    --w: 50px;
    --h: calc(6vh + 34.4px);
  }
`;
const TableCtrlHalf = styled.div`
  position: absolute;
  z-index: 3;
  & {
    --w: 50px;
    --h: calc(6vh + 16px);
  }
`;
const CornerStyle = `
  top: 0; left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(white, white calc(var(--h) - 7px), transparent calc(var(--h) - 7px), transparent);
  height: var(--h);
  width: var(--w);
`;
const ScrollXStyle = ({ theme }) => `
  top: 0;
  height: var(--h);
  display: flex;
  align-items: center;
  color: ${theme.palette.primary.main};
`;
const ScrollYStyle = ({ theme }) => `
  left: 0;
  width: var(--w);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${theme.palette.primary.main};
`;
const TableCtrl = {
  Full: {
    Corner: styled(TableCtrlFull)(CornerStyle),
    ScrollX: styled(TableCtrlFull)(ScrollXStyle),
    ScrollY: styled(TableCtrlFull)(ScrollYStyle),
  },
  Half: {
    Corner: styled(TableCtrlHalf)(CornerStyle),
    ScrollX: styled(TableCtrlHalf)(ScrollXStyle),
    ScrollY: styled(TableCtrlHalf)(ScrollYStyle),
  }
}

export default function TimeTable({
  up=()=>{}, down=()=>{}, enter=()=>{}, leave=()=>{}, click=()=>{},
  time=defaultTime, date=defaultDate, duration=defaultDuration,
  Grid, corner=null,
  disabled=false, hideDate=false, hideScroll=false, ...props
}) {
  const scrollRef = useRef();
  const scrollEle = scrollRef.current || props.containerProps?.ref?.current;
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

  const { Corner, ScrollX, ScrollY } = TableCtrl[hideDate ? "Half" : "Full"];
  return (
    <Container {...props} className={roboto_mono.className}>
      <div
        style={{ width: "100%", height: "100%", overflow: "auto" }}
        ref={scrollRef}
        {...(props.containerProps || {})}
      >
        <Table onDragStart={e => e.preventDefault()} className={disabled ? "disabled" : ""}>
          <tbody>
            <tr>
              <td></td>
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
      </div>
      <Corner>{corner}</Corner>
      {!hideScroll && (
        <>
          <ScrollX style={{ left: "var(--w)" }}>
            <IconButton size="small" color="primary" sx={{ opacity: 0.7 }}>
              <KeyboardArrowLeftIcon onClick={() => {
                scrollEle?.scrollBy?.({ left: -45, behavior: "smooth" });
              }}/>
            </IconButton>
          </ScrollX>
          <ScrollX style={{ right: 0 }}>
            <IconButton size="small" color="primary" sx={{ opacity: 0.7 }}>
              <KeyboardArrowRightIcon onClick={() => {
                scrollEle?.scrollBy?.({ left: +45, behavior: "smooth" });
              }}/>
            </IconButton>
          </ScrollX>
          <ScrollY style={{ top: "var(--h)" }}>
            <IconButton size="small" color="primary" sx={{ opacity: 0.7 }}>
              <KeyboardArrowUpIcon onClick={() => {
                scrollEle?.scrollBy?.({ top: -45, behavior: "smooth" });
              }}/>
            </IconButton>
          </ScrollY>
          <ScrollY style={{ bottom: 0 }}>
            <IconButton size="small" color="primary" sx={{ opacity: 0.7 }}>
              <KeyboardArrowDownIcon onClick={() => {
                scrollEle?.scrollBy?.({ top: +45, behavior: "smooth" });
              }}/>
            </IconButton>
          </ScrollY>
        </>
      )}
    </Container>
  );
}
