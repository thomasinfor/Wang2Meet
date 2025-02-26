"use client"
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDialogs } from "@toolpad/core";
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GoogleIcon from '@mui/icons-material/Google';
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import AvailableList from "@/components/AvailableList";
import { dump, parse, interpret, defaultTime, defaultDate, tableMap, cast } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";
import { useConfig } from "../MeetPanel";
import ClearScheduleImage from "@assets/clear-schedule.png";
import PasteScheduleImage from "@assets/paste-schedule.png";
import { Tables, SplitViewContainer, TableWrapper} from "@/components/SplitTableView";

export default function MeetEdit({ params }) {
  const dialogs = useDialogs();
  const { config, setConfig, wrapConfig, unwrapTable } = useConfig();
  const { user: _user, request, signIn } = useAuth();
  const [user, setUser] = useState(_user);
  useEffect(() => { setUser(_user); }, [_user]);
  const { message } = useStatus();
  const [table, setTable] = useState(null);
  const [focus, setFocus] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const update = useCallback(async (tbl, is_new=true) => {
    setTable(tbl);
    if (is_new) {
      setConfig(c => ({ ...c, collection: { ...c.collection, [user.email]: { ...c.collection[user.email], table: tbl } } }));
    }
    return tbl;
  }, [setTable, user, setConfig]);

  const sync = useCallback(async (t) => {
    const time = dump(unwrapTable(t || table));
    let res = user.temp ? await request('POST', `/api/anonymous/${params.meet}`, {
      body: { time, name, passwd: password }
    }) : await request('POST', `/api/${params.meet}`, {
      body: { time }
    });
    if (!res.ok) {
      return false;
    } else {
      res = await res.json();
      setConfig(cfg => {
        const newRes = wrapConfig(res);
        const new_col = {};
        for (let i in newRes.collection)
          new_col[i] = {
            ...newRes.collection[i],
            table: i === user.email ? cfg.collection[user.email].table : newRes.collection[i].table
          };
        return { ...newRes, collection: new_col };
      });
      return true;
    }
  }, [user, name, password, request, table, params.meet, setConfig, unwrapTable, wrapConfig]);

  const pasteSchedule = useCallback(async () => {
    if (!user || !table) return;
    try {
      let res = await request('GET', `/api/me`);
      if (res.ok) {
        res = await res.json();
        if (res.table) {
          res = parse(res.table);
          const t = cast(res, defaultDate, defaultTime, config.date, config.time, config.duration);
          await sync(await update(tableMap(table, (e, i, j) => e || t[i][j])));
          message("Schedule pasted", { variant: "success" });
        } else {
          if (await dialogs.open(props => (
            <Dialog fullWidth open={props.open} onClose={() => props.onClose(false)}>
              <DialogTitle>Default schedule not set.</DialogTitle>
              <DialogContent>
                <Typography>
                  Set your default weekly schedule now?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => props.onClose(false)} color="error">Later</Button>
                <Button onClick={() => props.onClose(true)}>Go!</Button>
              </DialogActions>
            </Dialog>
          ))) {
            window.open("/me#default-schedule");
          } else {
            message("Default schedule not set", { variant: "error" });
          }
        }
      } else {
        window.alert("Operation failed");
      }
    } catch(e) {
      console.error(e);
      window.alert("Operation failed");
    }
  }, [user, table, config, update, request, sync, message, dialogs]);

  const getAvailable = useCallback(f => Object.entries(config.collection).map(([k, v]) => ({
    name: v.name, email: k, available: v.table[f[0]][f[1]],
  })), [config]);

  const refs0 = useRef(null), refs1 = useRef(null);
  const refs = [refs0, refs1];
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
      if (refs0.current && refs1.current) {
        refs0.current.scrollTop = refs1.current.scrollTop;
        refs0.current.scrollLeft = refs1.current.scrollLeft;
      }
    }
  }, [focus, refs0, refs1]);

  async function setTempUser() {
    const res = await request('POST', `/api/anonymous/${params.meet}/check-user`, {
      body: { name, passwd: password }
    });
    if (res.ok)
      setUser({ email: name + "@TEMP", password, temp: true });
    else
      message(`Incorrect password associated with username "${name}"`, { variant: "error" });
  }

  return (
    <>
      <Stack direction="row" spacing={2}>
        {user && !user.temp &&
          <Chip
            icon={<ContentPasteGoIcon/>}
            label="Paste my schedule"
            variant="contained"
            color="primary"
            onClick={async () => {
              if (await dialogs.open(props => (
                <Dialog fullWidth open={props.open} onClose={() => props.onClose(false)}>
                  <DialogTitle>Confirm pasting default schedule?</DialogTitle>
                  <DialogContent>
                    <Typography sx={{ mb: 1 }}>
                      This operation applies your <Link href="/me#default-schedule" target="_blank">default weekly schedule</Link> to current event.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      Time slots that are already marked available will remain available.
                    </Typography>
                    <Image alt="paste-schedule.png" src={PasteScheduleImage} style={{ width: "100%", height: "auto" }}/>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => props.onClose(false)} color="error">No</Button>
                    <Button onClick={() => props.onClose(true)}>Yes</Button>
                  </DialogActions>
                </Dialog>
              ))) {
                await pasteSchedule();
              }
            }}
          />}
        {user &&
          <Chip
            icon={<RestartAltIcon/>}
            label="Clear"
            variant="contained"
            color="primary"
            onClick={async () => {
              if (await dialogs.open(props => (
                <Dialog fullWidth open={props.open} onClose={() => props.onClose(false)}>
                  <DialogTitle>Confirm clearing the schedule?</DialogTitle>
                  <DialogContent>
                    <Typography sx={{ mb: 1 }}>
                      After this operation, all time slots will be marked unavailable.
                    </Typography>
                    <Image alt="clear-schedule.png" src={ClearScheduleImage} style={{ width: "100%", height: "auto" }}/>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => props.onClose(false)} color="error">No</Button>
                    <Button onClick={() => props.onClose(true)}>Yes</Button>
                  </DialogActions>
                </Dialog>
              ))) {
                await sync(await update(tableMap(table, () => false)));
                message("Schedule cleared", { variant: "success" });
              }
            }}
          />}
      </Stack>
      <Tables>
        <SplitViewContainer className={(focus === null ? 'hidden' : "") + " pc"}>
          <AvailableList
            time={interpret(config.date, config.time, focus || [0, 0])}
            list={getAvailable(focus || [0, 0])}
            style={{ paddingTop: '30px', paddingBottom: '30px' }}
          />
        </SplitViewContainer>
        <SplitViewContainer
          className={(focus !== null ? 'hidden' : "") + (user ? "" : " no-border")}
        >
          {user ? (
            <TableWrapper>
              <EditTimeTable
                defaultTable={config.collection[user?.email]?.table || null}
                time={config.time}
                date={config.date}
                duration={config.duration}
                value={table}
                setValue={update}
                bufferTime={1}
                alarm={sync}
                mask={config.mask}
                containerProps={syncScroll(0)}
              />
            </TableWrapper>
          ) : (
            <Stack sx={{ p: 2.5 }} spacing={1} alignItems="center">
              {user === false ? <CircularProgress/> : (
                <>
                  <Chip
                    icon={<GoogleIcon/>}
                    label="Sign in to continue"
                    variant="contained"
                    color="primary"
                    onClick={signIn}
                  />
                  <Divider flexItem sx={{ pt: 1 }}>or</Divider>
                  <Typography>Use temporary account:</Typography>
                  <TextField
                    required
                    size="small"
                    label="Name"
                    variant="outlined"
                    fullWidth
                    onChange={e => setName(e.target.value)}
                    autoComplete="username"
                  />
                  <TextField
                    size="small"
                    label="Password (optional)"
                    variant="outlined"
                    fullWidth
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Typography variant="caption">* Temporary account is for this event only</Typography>
                  <Chip
                    label="Continue"
                    variant="contained"
                    color="primary"
                    disabled={name.length === 0}
                    onClick={setTempUser}
                  />
                </>
              )}
            </Stack>
          )}
        </SplitViewContainer>
        <SplitViewContainer className="pc">
          <TableWrapper>
            <ViewTimeTable
              value={config.collection}
              time={config.time}
              date={config.date}
              duration={config.duration}
              focus={focus}
              setFocus={setFocus}
              mask={config.mask}
              containerProps={syncScroll(1)}
            />
          </TableWrapper>
        </SplitViewContainer>
      </Tables>
    </>
  );
}

