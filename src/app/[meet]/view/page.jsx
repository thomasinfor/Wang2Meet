"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Linear from "@/components/Linear";
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { dump, parse, interpret, pad, defaultTime, defaultDate, tableMap, cast } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";
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
const SplitViewContainer = styled(Container)`
  width: 45%;
  @media (max-width: 700px) {
    width: 100%;
    &.view {
      display: none;
    }
  }
`;
const AvailableListContainer = styled(Linear)`
  box-sizing: border-box;
  justify-content: flex-start;
`;
const TableWrapper = styled.div`
  max-width: 100%;
  max-height: 95vh;
`;
const SwitchButton = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  opacity: 0.8;
  z-index: 10;
`;
const SmallMenuItem = styled(MenuItem)(({ theme }) => ({
  minHeight: 0,
  maxWidth: '100%',
  alignItems: 'baseline',
  "& > span": {
    color: '#888',
    fontSize: 'x-small',
  },
}));
const Indicator = styled(TableCell)(({ theme }) => ({
  width: '20px',
  "& > div" : {
    display: 'flex'
  }
}));

export default function MeetView({ params }) {
  const { config } = useConfig();
  const [viewGroup, setViewGroup] = useState(true);
  const [viewFocus, setViewFocus] = useState([0, 0]);
  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);

  const refs = [useRef(null), useRef(null)];
  function syncScroll(i) {
    return {
      ref: refs[i],
      onScroll: scroll => {
        if (refs[1-i].current) {
          refs[1-i].current.scrollTop = scroll.target.scrollTop;
          refs[1-i].current.scrollLeft = scroll.target.scrollLeft;
        }
      }
    }
  }
  useEffect(() => {
    if (!focus) {
      if (refs[0].current && refs[1].current) {
        refs[0].current.scrollTop = refs[1].current.scrollTop;
        refs[0].current.scrollLeft = refs[1].current.scrollLeft;
      }
    }
  }, [focus]);

  return (
    <>
      <Typography variant="h5" sx={{
        overflow: "auto",
        maxWidth: "100%",
        padding: "5px 10px",
        boxSizing: "border-box",
      }}>{config.title}</Typography>
      <div style={{ maxWidth: '100%', margin: '0 10px' }}>
        <FormControl sx={{ p: 1, maxWidth: '100%', minWidth: 120, boxSizing: 'border-box' }} size="small">
          <InputLabel>Target</InputLabel>
          <Select
            value={viewGroup}
            label="Target"
            onChange={e => setViewGroup(e.target.value)}
            sx={{ "& .MuiSelect-select > span": { display: 'none' } }}
          >
            <SmallMenuItem value={true}>
              <em>ALL</em>
            </SmallMenuItem>
            {Object.entries(config.collection).map(([k, v], i) =>
              <SmallMenuItem value={k} key={k}>
                {v.name}<span>&nbsp;&nbsp;{k}</span>
              </SmallMenuItem>)}
          </Select>
        </FormControl>
      </div>
      {viewGroup === true && viewFocus &&
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
              value={viewGroup === true ? config.collection
                : { [viewGroup]: config.collection[viewGroup] }}
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

