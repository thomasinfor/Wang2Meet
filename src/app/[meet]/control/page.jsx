"use client"
import React from "react";
import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import Typography from '@mui/material/Typography';
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { interpret } from "@/utils";
import { useConfig } from "../layout";

const Tables = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100vw;
  gap: 20px;
  flex-wrap: wrap;
  overflow: auto;
  padding: 0 10px;
  box-sizing: border-box;
`;
const Container = styled.div`
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  border: 1px dashed black;
  border-radius: 5px;
`;
const TableWrapper = styled.div`
  max-width: 100%;
  max-height: 95vh;
`;

export default function MeetControl() {
  const { config } = useConfig();
  const [viewFocus, setViewFocus] = useState([0, 0]);
  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);

  return (
    <>
      <Typography variant="h5" sx={{
        overflow: "auto",
        maxWidth: "100%",
        padding: "5px 10px",
        boxSizing: "border-box",
      }}>Settle up</Typography>
      {viewFocus &&
        <AvailableList
          list={getAvailable(viewFocus)}
          time={interpret(config.date, config.time[0], viewFocus)}
          style={{ position: 'sticky', top: '5px', zIndex: 10, pointerEvents: 'none', opacity: 0.6, margin: '0 10px' }}
        />}
      <Tables>
        <Container>
          <TableWrapper className="constrained">
            <ViewTimeTable
              keepFocus
              value={config.collection}
              time={config.time}
              date={config.date}
              duration={config.duration}
              focus={viewFocus}
              setFocus={setViewFocus}
            />
          </TableWrapper>
        </Container>
      </Tables>
    </>
  );
}

