"use client"
import React from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import styled from "@emotion/styled";
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Input from '@mui/material/Input';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TuneIcon from '@mui/icons-material/Tune';
import PushPinIcon from '@mui/icons-material/PushPin';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { interpret, slotBefore } from "@/utils";
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
const SmallMenuItem = styled(MenuItem)(() => ({
  minHeight: 0,
  maxWidth: '100%',
  alignItems: 'baseline',
  "& > span": {
    color: '#888',
    fontSize: 'x-small',
  },
}));

export default function MeetView() {
  const { config } = useConfig();
  const SP = useSearchParams();
  const highlight = useMemo(() => {
    let lst = (SP.get("range") || "").split(",").map(e => parseInt(e));
    if (lst.length !== 4 || lst.some(e => isNaN(e) || e < 0 || e >= 96))
      return false;
    const res = [[lst[0], lst[1]], [lst[2], lst[3]]];
    if (!slotBefore(...res))
      return false;
    return res;
  }, [SP]);
  const [showHightlight, setShowHightlight] = useState(true);

  const [viewGroup, setViewGroup] = useState(true);
  const [viewFocus, setViewFocus] = useState([0, 0]);
  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);
  const shiftViewGroup = useCallback(d => setViewGroup(v => {
    if (v === true) return v;
    const l = Object.keys(config.collection);
    return l[(l.indexOf(v) + d + l.length) % l.length];
  }), [setViewGroup, config]);

  useEffect(() => {
    function onkeydown(e) {
      // console.log(e.key, e);
      if (e.key === " ") {
        e.preventDefault();
        setShowHightlight(h => !h);
      }
      if (e.key === "ArrowRight") {
        shiftViewGroup(1);
      }
      if (e.key === "ArrowLeft") {
        shiftViewGroup(-1);
      }
    }
    document.addEventListener("keydown", onkeydown);
    return () => document.removeEventListener("keydown", onkeydown);
  }, [setShowHightlight, shiftViewGroup]);

  const [pconfigOpen, setPconfigOpen] = useState(false);
  const defaultPconfig = useMemo(() => Object.fromEntries(Object.keys(config.collection).map(k => [k, 1])), [config.collection]);
  const [pconfig, setPconfig] = useState(defaultPconfig);
  useEffect(() => {
    setPconfig(p => Object.fromEntries(Object.entries(defaultPconfig).map(([k, v]) => [k, (k in p) ? p[k] : v])));
  }, [defaultPconfig]);

  return (
    <>
      {viewGroup === true && viewFocus &&
        <AvailableList
          list={getAvailable(viewFocus)}
          time={interpret(config.date, config.time[0], viewFocus)}
          style={{ position: 'sticky', top: '5px', zIndex: 10, pointerEvents: 'none', opacity: 0.6, margin: '0 10px' }}
        />}
      <Stack direction="row" spacing={2} sx={{ m: 1.5 }}>
        {highlight &&
          <Chip
            icon={<LightbulbIcon sx={showHightlight ? { color: 'yellow!important' } : {}}/>}
            label="Highlight"
            variant="contained"
            color="primary"
            onClick={() => setShowHightlight(s => !s)}
          />}
      </Stack>
      <Stack direction="row" alignItems="center">
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
            {Object.entries(config.collection).map(([k, v]) =>
              <SmallMenuItem value={k} key={k}>
                {v.name}<span>&nbsp;&nbsp;{k}</span>
              </SmallMenuItem>)}
          </Select>
        </FormControl>
        {viewGroup === true &&
          <IconButton color="primary" onClick={() => setPconfigOpen(true)}>
            <TuneIcon/>
          </IconButton>}
      </Stack>
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
              highlightRange={showHightlight && highlight}
              weight={pconfig}
            />
          </TableWrapper>
        </Container>
      </Tables>
      <ParticipantConfig
        config={config}
        value={pconfig}
        setValue={setPconfig}
        open={pconfigOpen}
        onClose={() => setPconfigOpen(false)}
        fullWidth
      />
    </>
  );
}

function ParticipantConfig({ config, value, setValue, sx={}, open=true, onClose=()=>{}, ...props }) {
  const [focus, setFocus] = useState(null);
  const [transparent, setTransparent] = useState(false);

  useEffect(() => {
    setFocus(null);
  }, [open]);

  return (
    <Dialog {...props} onClose={onClose} open={open} sx={{ ...sx, opacity: transparent ? 0.8 : undefined }}>
      <DialogTitle>
        Customization
        <FormControlLabel control={<Switch/>} label="transparent" sx={{
          position: 'absolute',
          right: 0
        }} onChange={e => setTransparent(e.target.checked)} checked={transparent}/>
      </DialogTitle>
      <DialogContent>
        {/*<DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText>*/}
        <Table>
          <TableHead>
            <TableRow sx={{ "& > *": { pb: 1 } }}>
              <TableCell>Participants</TableCell>
              <TableCell align="center">Pin</TableCell>
              <TableCell align="right">Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(value).sort(
              (a, b) => a[1] === Infinity ? -1 : b[1] === Infinity ? 1 : b[1]-a[1]
            ).map(([email, weight]) => (
              <TableRow
                key={email}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: email === focus ? "#eee" : undefined }}
                onPointerDown={() => setFocus(email)}
              >
                <TableCell component="th" sx={{ py: 0.5 }} scope="row">
                  <Typography variant="body1" display="block">
                    {config.collection[email].name}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ lineHeight: 1 }} color={"#aaa"}>
                    {email}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 0 }}>
                  <IconButton color={weight === Infinity ? "primary" : "disabled"} onClick={
                    () => setValue(v => ({ ...v, [email]: v[email] === Infinity ? 1 : Infinity }))
                  }>
                    <PushPinIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <Input
                    value={String(weight)}
                    size="small"
                    type="number"
                    sx={{ width: 40, "& input": { textAlign: "right" } }}
                    onChange={e => {
                      setValue(v => ({ ...v, [email]: Math.max(e.target.value, 0) }));
                      e.target.scrollIntoView();
                    }}
                    onFocus={e => e.target.select()}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}