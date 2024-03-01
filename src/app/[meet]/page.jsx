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
import Linear from "@/components/Linear";
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import { dump, parse, interpret, pad, defaultTime, defaultDate, tableMap, cast } from "@/utils";
import { useAuth } from "@/context/Auth";

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

function AvailableList({ list=[], time=false, ...props }) {
  return (
    <AvailableListContainer {...props}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#ddd" }}>
              <TableCell align="center">{list.filter(e => e.available).length}</TableCell>
              <TableCell align="center" sx={{ minWidth: '145px' }}>
                {time && `${time[0]}/${time[1]}/${time[2]} ${time[3]} ${pad(time[4], 2)}:${pad(time[5], 2)}`}
              </TableCell>
              <TableCell align="center">{list.filter(e => !e.available).length}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(({ name, email, available}, i) => (
              <TableRow key={email}>
                <Indicator align="center">
                  {available && <div><CheckIcon color="success" fontSize="small"/></div>}
                </Indicator>
                <TableCell align="center">{name}</TableCell>
                <Indicator align="center">
                  {!available && <div><CloseIcon color="error" fontSize="small"/></div>}
                </Indicator>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AvailableListContainer>
  );
}

export default function Meet({ params }) {
  const { user, request, addHistory, delHistory } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [table, setTable] = useState(null);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    (async () => {
      let res = await request('GET', `/api/${params.meet}`);
      if (res.ok) {
        res = await res.json();
        for (let i in res.collection)
          res.collection[i].table = parse(res.collection[i].table);
        setConfig(res);
      } else {
        delHistory(params.meet);
        router.push("/");
      }
    })();
  }, [params.meet, delHistory, request]);
  useEffect(() => {
    if (config) {
      addHistory(config);
    }
  }, [config]);

  const update = useCallback(async (tbl, is_new=true) => {
    setTable(tbl);
    if (is_new) {
      setConfig(c => ({ ...c, collection: { ...c.collection, [user.email]: { ...c.collection[user.email], table: tbl } } }));
    }
  }, [setTable, user]);

  const sync = useCallback(async (t) => {
    const time = dump(t || table);
    let res = await request('POST', `/api/${params.meet}`, {
      body: { time }
    });
    if (!res.ok) {
      return false;
    } else {
      res = await res.json();
      for (let i in res.collection)
          res.collection[i].table = i === user.email ? (t || table) : parse(res.collection[i].table);
      setConfig(res);
      return true;
    }
  }, [user, request, table]);

  const pasteSchedule = useCallback(async () => {
    if (!user || !table) return;
    try {
      let res = await request('GET', `/api/me`);
      if (res.ok) {
        res = await res.json();
        if (res.table) {
          res = parse(res.table);
          const t = cast(res, defaultDate, defaultTime, config.date, config.time, config.duration);
          const newTable = tableMap(table, (e, i, j) => e || t[i][j]);
          await update(newTable);
          await sync(newTable);
        } else {
          window.alert("Default table not set");
        }
      } else {
        window.alert("Operation failed");
      }
    } catch(e) {
      console.error(e);
      window.alert("Operation failed");
    }
  }, [user, table, setTable, config, update, request, sync]);

  const [tab, setTab] = useState("edit");
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
        if (refs[1-i]) {
          refs[1-i].current.scrollTop = scroll.target.scrollTop;
          refs[1-i].current.scrollLeft = scroll.target.scrollLeft;
        }
      }
    }
  }

  const content = !config ? {} : {
    edit: (
      <>
        {Boolean(user) || <Alert severity="info">Sign in to continue</Alert>}
        <Stack direction="row" spacing={2}>
          {user &&
            <Chip
              icon={<ContentPasteGoIcon/>}
              label="Paste my schedule"
              variant="contained"
              color="primary"
              onClick={() => { if (window.confirm("Confirm to paste default schedule?")) pasteSchedule(); }}
            />}
        </Stack>
        <Tables>
          <SplitViewContainer {...syncScroll(0)}>
            {focus !== null
              ? <AvailableList
                  time={interpret(config.date, config.time[0], focus)}
                  list={getAvailable(focus)}
                  style={{ paddingTop: '30px' }}
                />
              : <TableWrapper>
                  <EditTimeTable
                    defaultTable={config.collection[user?.email]?.table || null}
                    disabled={!user}
                    time={config.time}
                    date={config.date}
                    duration={config.duration}
                    value={table}
                    setValue={update}
                    bufferTime={1}
                    alarm={sync}
                  />
                </TableWrapper>}
          </SplitViewContainer>
          <SplitViewContainer className="view" {...syncScroll(1)}>
            <TableWrapper>
              <ViewTimeTable
                value={config.collection}
                time={config.time}
                date={config.date}
                duration={config.duration}
                focus={focus}
                setFocus={setFocus}
              />
            </TableWrapper>
          </SplitViewContainer>
        </Tables>
      </>
    ),
    view: (
      <>
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
    )
  };

  return (
    <main>
      {config &&
        <Linear style={{ minHeight: 'calc(100vh - 64px)', gap: '10px', padding: '15px 0' }}>
          <SwitchButton>
            {[
              ["edit", "Editing", EditIcon],
              ["view", "Viewing", VisibilityIcon],
            ].map(([id, label, Icon], i, arr) =>
              <Chip
                sx={{ display: id !== tab ? 'none' : undefined, fontWeight: 'bold' }}
                key={id}
                icon={<Icon/>}
                label={label}
                variant="contained"
                color="primary"
                onClick={() => setTab(arr[(i+1)%arr.length][0])}
              />)}
          </SwitchButton>
          <Typography variant="h5" sx={{
            overflow: "auto",
            maxWidth: "100%",
            padding: "5px 10px",
            boxSizing: "border-box",
          }}>{config.title}</Typography>
          {content[tab]}
        </Linear>}
    </main>
  );
}

