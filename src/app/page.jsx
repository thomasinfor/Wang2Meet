"use client"
import { useState } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import Linear from "@/components/Linear";

const GridElement = styled.td`
  width: 40px;
  height: 40px;
  text-align: center;
  background: lightgreen;
  user-select: none;
`;

function Grid({ children, id, down=()=>{}, enter=()=>{}, selected=false }) {
  return (
    <GridElement
      onMouseDown={down}
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

  return (
    <main onMouseUp={up}>
      <Linear style={{ height: '100vh' }}>
        <table>
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
        </table>
      </Linear>
    </main>
  );
}
