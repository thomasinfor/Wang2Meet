"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import Linear from "@/components/Linear";

const GridElement = styled.td`
  width: 40px;
  height: 40px;
  text-align: center;
  background: lightgreen;
  user-select: none;
  touch-action: pan-down;
  border: 1px solid white;
`;
const Table = styled.table`
  border-spacing: 0;
  user-select: none;
  & * {
    user-select: none;
  }
`;

function Grid({ children, id, down=()=>{}, enter=()=>{}, selected=false }) {
  return (
    <GridElement
      id={id}
      onPointerDown={down}
      onMouseEnter={enter}
      style={selected ? { background: 'red' } : undefined}
    >
      {id}
    </GridElement>
  );
}

function inRange(v, l, r){ return (l <= v && v <= r) || (r <= v && v <= l); }
const ROW = new Array(8).fill(0).map((e, i) => i);
const COL = new Array(8).fill(0).map((e, i) => i);
export default function Home() {
  const [sel, setSel] = useState(null);
  console.log(JSON.stringify(sel));

  function up() {
    // console.log("up");
    setSel(null);
  }
  function down(i, j) {
    // console.log("down", i, j);
    setSel([[i, j], [i, j]]);
  }
  function enter(i, j) {
    // console.log("enter", i, j);
    setSel(sel => sel && [sel[0], [i, j]]);
  }

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
  }, [enter]);

  return (
    <main onMouseUp={up}>
      <Linear style={{ height: '100vh' }}>
        <Table onDragStart={e => e.preventDefault()}>
          <tbody>
            {ROW.map(i =>
              <tr key={i}>
                {COL.map(j =>
                  <Grid
                    key={j} id={`${i}-${j}`}
                    down={() => down(i, j)}
                    enter={() => enter(i, j)}
                    selected={sel && inRange(i, sel[0][0], sel[1][0]) && inRange(j, sel[0][1], sel[1][1])}
                  />)}
              </tr>)}
          </tbody>
        </Table>
      </Linear>
    </main>
  );
}
