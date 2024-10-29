"use client"
import React from "react";
import { useMemo } from "react";
import styled from "@emotion/styled";
import { Time } from "@/utils";

const GridElement = styled.td(({ theme }) => `
  background: #DDD;
  touch-action: none;
  border: 1px solid black;
  &.on {
    background: ${theme.palette.primary.main};
  }
  &.covered:not(.disabled) {
    border-width: 0;
  }
  &.disabled {
    background: gray;
    // pointer-events: none;
  }

  &.section0 {
    border-bottom: none;
  }
  &.section1 {
    border-top: none; border-bottom-style: dotted;
  }
  &.section2 {
    border-top: none; border-bottom: none;
  }
  &.section3 {
    border-top: none;
  }
  & * {
    pointer-events: none;
  }
`);

export default function BaseGrid({
  i, j, time, down=()=>{}, enter=()=>{}, leave=()=>{}, click=()=>{}, id,
  className="", children, ...props
}) {
  const timeObj = useMemo(() => new Time(time), [time]);
  return (
    <GridElement
      id={id}
      onPointerDown={() => down(i, j)}
      onMouseEnter={() => enter(i, j)}
      onMouseLeave={() => leave(i, j)}
      onClick={() => click(i, j)}
      className={`section${timeObj.section} ${className}`}
      {...props}
    >{children}</GridElement>
  );
}

