"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import Linear from "@/components/Linear";

const GridElement = styled.td`
  background: #DDD;
  touch-action: pan-down;
  border: 1px solid black;
  &.selected {
    background: #66aaaa;
  }
  &.covered {
    border-color: #DDD;
  }
  &.covered.selected {
    border-color: #66aaaa;
  }
`;
const Table = styled.table`
  padding: 20px 0;
  border-spacing: 0;
  user-select: none;
  text-align: center;
  & td {
    width: 50px;
    height: 10px;
    box-sizing: border-box;
  }
`;
const TimeTd = styled.td`
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateY(-50%);
  font-size: smaller;
`;

function inRange(v, l, r){ return (l <= v && v <= r) || (r <= v && v <= l); }
function pad(n, digit){ return `0000000000${n}`.slice(-digit); }
class Time{
  constructor(i, j) {
    this.hour = parseInt(i / 4);
    this.section = i % 4;
    this.minute = this.section * 15;
    this.week = j + 1;
    this.id = `${i}-${j}`;
    this.timeStr = `${pad(this.hour, 2)}:${pad(this.minute, 2)}`
  }
}
const ROW = new Array(12 * 4).fill(0).map((e, i) => i);
const COL = new Array(7).fill(0).map((e, i) => i);
const dayOfWeek = "Sun Mon Tue Wed Thu Fri Sat".split(" ");

function Grid({ children, time, down=()=>{}, enter=()=>{}, selected=false, covered=false }) {
  return (
    <GridElement
      id={time.id}
      onPointerDown={down}
      onMouseEnter={enter}
      className={[selected && "selected", covered && "covered"].filter(e => e).join(' ')}
      style={[
        { borderBottom: 'none' },
        { borderTop: 'none', borderBottomStyle: 'dotted' },
        { borderTop: 'none', borderBottom: 'none' },
        { borderTop: 'none' },
      ][time.section]}
    >
    </GridElement>
  );
}

export default function Home() {
  const [sel, setSel] = useState(null);
  const [on, setOn] = useState(ROW.map(() => COL.map(() => false)));
  // console.log(JSON.stringify(sel));

  const covered = useCallback((i, j) => sel && inRange(i, sel[0][0], sel[1][0]) && inRange(j, sel[0][1], sel[1][1]), [sel]);
  const modified = useCallback((i, j) => covered(i, j) ? !on[sel[0][0]][sel[0][1]] : on[i][j], [sel, on, covered]);
  
  const up = useCallback(() => {
    console.log("up", sel);
    if (sel){
      setOn(o => o.map((row, i) => row.map((e, j) => modified(i, j))));
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
        if (idx.length == 2)
          enter(idx[0], idx[1]);
      } catch(e) {}
    }
    document.addEventListener("touchmove", touch);
    document.addEventListener("touchend", up);
    return () => {
      document.removeEventListener("touchmove", touch);
      document.removeEventListener("touchend", up);
    };
  }, [enter, up]);

  return (
    <main onMouseUp={up}>
      <Linear style={{ minHeight: '100vh' }}>
        <Table onDragStart={e => e.preventDefault()}>
          <tbody>
            <tr>
              <td></td>
              {COL.map(j =>
                <td key={j}>{dayOfWeek[j % 7]}</td>)}
            </tr>
            {ROW.map(i =>
              <tr key={i}>
                <TimeTd>
                  {new Time(i, 0).section === 0 && new Time(i, 0).timeStr}
                </TimeTd>
                {COL.map(j =>
                  <Grid
                    key={j} time={new Time(i, j)}
                    down={() => down(i, j)}
                    enter={() => enter(i, j)}
                    selected={modified(i, j)}
                    covered={covered(i, j)}
                  />)}
              </tr>)}
            <tr>
              <TimeTd>
                {new Time(ROW[ROW.length-1]+1, 0).section === 0 && new Time(ROW[ROW.length-1]+1, 0).timeStr}
              </TimeTd>
            </tr>
          </tbody>
        </Table>
      </Linear>
    </main>
  );
}
