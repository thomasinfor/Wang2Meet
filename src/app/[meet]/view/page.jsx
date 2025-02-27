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
import PushPinIcon from '@mui/icons-material/PushPin';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { interpret } from "@/utils";
import { useConfig } from "../MeetPanel";
import { Tables, SplitViewContainer, TableWrapper} from "@/components/SplitTableView";

function Details({ children }) {
  return (
    <Typography sx={{ color: 'text.secondary', "&:before": { content: "'> '" } }} variant="caption">
      {children}
    </Typography>
  );
}

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
    if (
      lst.length !== 2 ||
      lst.some(e =>
        isNaN(e) ||
        e < 0 ||
        e >= config.duration * (config.time[1] - config.time[0]) * 4 ||
        parseInt(e) !== e
      )
    ) return false;
    if (lst[0] > lst[1])
      return false;
    return lst;
  }, [SP, config]);
  const [showHightlight, setShowHightlight] = useState(true);
  const [highlightMax, setHighlightMax] = useState(true);

  const [viewGroup, setViewGroup] = useState(true);
  const [viewFocus, setViewFocus] = useState(null);
  useEffect(() => {
    if (viewGroup === true)
      setViewFocus(null);
    else
      setViewFocus(f => f || [0, 0]);
  }, [setViewFocus, viewGroup]);
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
  const [modalTransparent, setModalTransparent] = useState(false);

  return (
    <>
      {viewGroup === true && viewFocus &&
        <AvailableList
          className="mobile"
          list={getAvailable(viewFocus)}
          time={interpret(config.date, config.time, viewFocus)}
          hideDate={config.weekly}
          style={{ position: 'fixed', top: '75px', zIndex: 10, pointerEvents: 'none', opacity: 0.6, margin: '0 10px' }}
        />}
      <div style={{ width: "95%", maxWidth: 600, paddingBottom: 10 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
            <Stack>
              <Typography>View target</Typography>
              <Details>
                Currenlty viewing: <b>{viewGroup === true ? <i>all participants</i> : viewGroup}</b>
              </Details>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
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
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
            <Stack>
              <Typography>Highlights</Typography>
              <Details>
                Highlight important information on the timetable
              </Details>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" spacing={2}>
              {!highlight && viewGroup !== true &&
                <Typography variant="body2">Nothing to highlight for now.</Typography>}
              {highlight &&
                <Chip
                  icon={<LightbulbIcon sx={showHightlight ? { color: 'yellow!important' } : {}}/>}
                  label="Selected Range"
                  variant="contained"
                  color="primary"
                  onClick={() => setShowHightlight(s => !s)}
                />}
              {viewGroup === true &&
                <Chip
                  icon={<ChangeCircleIcon style={{ color: "white" }}/>}
                  label="Max Participants"
                  variant="contained"
                  color={highlightMax ? "purple" : "green"}
                  onClick={() => setHighlightMax(h => !h)}
                />}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion className="mobile">
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
            <Stack>
              <Typography>Weights & Pins</Typography>
              <Details>
                Mark / exclude someone or assign importance
              </Details>
            </Stack>
          </AccordionSummary>
          <ParticipantConfig
            config={config}
            value={pconfig}
            setValue={setPconfig}
          />
        </Accordion>
      </div>
      <Tables>
        <SplitViewContainer className={"pc " + (viewFocus ? "" : "hidden")}>
          <AvailableList
            list={getAvailable(viewFocus || [0, 0])}
            time={interpret(config.date, config.time, viewFocus || [0, 0])}
            hideDate={config.weekly}
            style={{ paddingTop: '30px', paddingBottom: '30px' }}
          />
        </SplitViewContainer>
        <SplitViewContainer className={"pc " + (viewFocus ? "hidden" : "")}>
          {viewGroup === true &&
            <TableWrapper style={{ width: '100%' }}>
              <ParticipantConfig
                config={config}
                value={pconfig}
                setValue={setPconfig}
              />
            </TableWrapper>
          }
        </SplitViewContainer>
        <SplitViewContainer>
          <TableWrapper>
            <ViewTimeTable
              keepFocus={viewGroup !== true}
              value={viewGroup === true ? config.collection
                : { [viewGroup]: config.collection[viewGroup] }}
              time={config.time}
              date={config.date}
              duration={config.duration}
              focus={viewFocus}
              setFocus={setViewFocus}
              highlightRange={showHightlight && highlight}
              weight={viewGroup === true ? pconfig : false}
              highlightMax={highlightMax && viewGroup === true}
              mask={config.mask}
              index={config.index}
              hideDate={config.weekly}
            />
          </TableWrapper>
        </SplitViewContainer>
      </Tables>
      <Dialog
        fullWidth
        onClose={() => setPconfigOpen(false)}
        open={pconfigOpen}
        sx={{ opacity: modalTransparent ? 0.8 : undefined }}
        className="mobile"
      >
        <DialogTitle>
          Customization
          <FormControlLabel control={<Switch/>} label="transparent" sx={{
            position: 'absolute',
            right: 0
          }} onChange={e => setModalTransparent(e.target.checked)} checked={modalTransparent}/>
        </DialogTitle>
        <DialogContent>
          {/*<DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>*/}
          <ParticipantConfig
            config={config}
            value={pconfig}
            setValue={setPconfig}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPconfigOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ParticipantConfig({ config, value, setValue, ...props }) {
  const [focus, setFocus] = useState(null);

  return (
    <Table {...props}>
      <TableHead>
        <TableRow sx={{ "& > *": { pb: 1 } }}>
          <TableCell>Participants</TableCell>
          <TableCell align="center">Pin</TableCell>
          <TableCell align="right">Weight</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(value)/*.sort(
          (a, b) => a[1] === Infinity ? -1 : b[1] === Infinity ? 1 : b[1]-a[1]
        )*/.map(([email, weight]) => (
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
                {email.endsWith("@TEMP") ? "" : email}
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
                value={weight === Infinity ? "" : String(weight)}
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
  );
}