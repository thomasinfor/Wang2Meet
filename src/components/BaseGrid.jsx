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
`;

export default function BaseGrid({
  i, j, time, day, down=()=>{}, enter=()=>{}, leave=()=>{}, id,
  className="", children, ...props
}) {
  const timeObj = useMemo(() => new Time(time), [time]);
  return (
    <GridElement
      id={id}
      onPointerDown={() => down(i, j)}
      onMouseEnter={() => enter(i, j)}
      onMouseLeave={() => leave(i, j)}
      className={`section${timeObj.section} ${className}`}
      {...props}
    >{children}</GridElement>
  );
}

