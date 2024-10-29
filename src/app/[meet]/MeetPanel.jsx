"use client"
import React from "react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation'
import { useDialogs } from "@toolpad/core";
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import PublicIcon from '@mui/icons-material/Public';
import Linear from "@/components/Linear";
import TimezoneSelector from "@/components/TimezoneSelector";
import { getTimezoneHere, wrapConfig as _wrapConfig, unwrapTable } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";

const modes = [
  ["edit", "Edit", EditIcon],
  ["view", "View", VisibilityIcon],
  ["control", "Control", SettingsIcon],
];

const Context = createContext(false);
export function useConfig() { return useContext(Context); }

function ChangeInfoForm({ open, onClose, payload }) {
  const [text, setText] = useState(payload.defaultValue);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(false)}>
      <DialogTitle>Change {payload.field}</DialogTitle>
      <DialogContent>
        <TextField
          sx={{ my: 2 }}
          size="small"
          autoComplete="off"
          fullWidth
          label={payload.field}
          variant="outlined"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="error">Cancel</Button>
        <Button onClick={() => onClose(text)}>Change</Button>
      </DialogActions>
    </Dialog>
  )
}

const textStyle = {
  overflow: "hidden",
  width: "100%",
  padding: "0 10px",
  boxSizing: "border-box",
  textAlign: "center",
};

export default function MeetPanel({ params, children }) {
  const dialogs = useDialogs();
  const { request, addHistory, delHistory, user } = useAuth();
  const { message } = useStatus();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const isAdmin = config?.creator?.email && (config?.creator?.email === user?.email);
  const [tz, setTz] = useState(getTimezoneHere());
  const wrapConfig = useCallback(cfg => _wrapConfig(cfg, tz), [tz]);

  useEffect(() => {
    (async () => {
      let res = await request('GET', `/api/${params.meet}`);
      if (res.ok) {
        setConfig(wrapConfig(await res.json()));
      } else {
        message("Event not found", { variant: "error" });
        if (res.status === 404)
          delHistory(params.meet);
        router.push("/");
      }
    })();
  }, [params.meet, delHistory, addHistory, request, message, router, wrapConfig]);
  useEffect(() => {
    if (config) {
      addHistory(config);
    }
  }, [config, addHistory]);

  const pathname = usePathname();
  const tab = pathname.split('/')[2];
  const nextTab = useCallback(() => {
    const idx = modes.map(e => e[0]).indexOf(tab);
    if (idx === -1) return;
    router.push(`/${config.id}/${modes[(idx+1) % modes.length][0]}`);
  }, [router, config, tab]);
  const FABicon = (() => {
    const current = modes.filter(e => e[0] === tab).pop();
    if (!current) return <CircularProgress color="inherit" size={20}/>;
    else {
      const Icon = current[2];
      return <Icon onPointerDown={evt => {
        if (evt.pointerType !== "mouse") return;
        nextTab();
      }}/>;
    }
  })();
  const [FABopen, setFABopen] = useState(false);

  useEffect(() => {
    function onkeydown(e) {
      if (e.key === "Tab") {
        // e.preventDefault();
        // nextTab();
      }
    }
    document.addEventListener("keydown", onkeydown);
    return () => document.removeEventListener("keydown", onkeydown);
  }, [nextTab]);

  return (
    <Context.Provider value={{
      config, setConfig,
      wrapConfig,
      unwrapTable: useCallback(t => unwrapTable(t, config, tz), [tz, config])
    }}>
      <main>
        {config &&
          <Linear style={{ minHeight: 'calc(100vh - 56px)', gap: '10px', padding: '15px 0', justifyContent: 'flex-start' }}>
            <SpeedDial
              direction="down"
              ariaLabel="mode-switch"
              sx={{ position: 'absolute', top: 10, left: 10, opacity: 0.8, transform: "scale(0.8)", transformOrigin: "top left" }}
              icon={FABicon}
              onClose={() => setFABopen(false)}
              onOpen={() => setFABopen(true)}
              open={FABopen}
            >
              {modes.filter(e => e[0] !== tab).map(([id, label, Icon]) => (
                <SpeedDialAction
                  key={id}
                  icon={<Icon/>}
                  tooltipOpen
                  tooltipPlacement="right"
                  tooltipTitle={label}
                  onClick={() => {
                    router.push(`/${config.id}/${id}`);
                    setFABopen(false);
                  }}
                />
              ))}
            </SpeedDial>
            <Stack direction="row" spacing={1} alignSelf="flex-end" sx={{ px: 1.5 }}>
              <Chip icon={<PublicIcon/>} label={tz} onClick={async () => {
                const res = await dialogs.open(TimezoneSelector, { defaultValue: tz });
                console.log(res);
                if (res && res !== tz) {
                  setTz(res);
                  setConfig(null);
                }
              }}/>
            </Stack>
            <Accordion sx={{
              maxWidth: '90%', minWidth: '400px',
              borderWidth: 1, borderStyle: "solid", borderColor: "primary.main",
              borderRadius: "12px!important", boxShadow: "none", "&:before": { display: 'none' },
              "& *:not(.MuiSvgIcon-root, .MuiAccordionSummary-expandIconWrapper)" : {
                overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
              }
            }} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                sx={{
                  "& .MuiAccordionSummary-content:not(.Mui-expanded)" : {
                    whiteSpace: "nowrap",
                  },
                  "& *": {
                    overflowY: 'visible!important'
                  }
                }}>
                <Typography variant="h5" sx={textStyle}>
                  {isAdmin &&
                    <IconButton color="primary" onClick={async event => {
                      if (!isAdmin) return;
                      event.stopPropagation();
                      const newTitle = await dialogs.open(ChangeInfoForm, { field: "Title", defaultValue: config.title });
                      if (newTitle === false) return;
                      let res = await request('POST', `/api/${params.meet}/modify`, {
                        body: { title: newTitle }
                      });
                      if (res.ok) {
                        setConfig(wrapConfig(await res.json()));
                        message("Update successfully", { variant: "success" });
                      } else {
                        message("Update failed", { variant: "error" });
                      }
                    }} sx={{ transform: 'translateY(-1px)', float: "left" }}>
                      <EditIcon fontSize="small"/>
                    </IconButton>}
                  {config.title}
                </Typography>
              </AccordionSummary>
              {config.description &&
                <AccordionDetails sx={{ whiteSpace: "pre-line", display: "flex", justifyContent: "center" }}>
                  <Typography sx={textStyle}>
                    {isAdmin &&
                      <IconButton color="primary" onClick={async event => {
                      if (!isAdmin) return;
                      event.stopPropagation();
                      const newDescription = await dialogs.open(ChangeInfoForm, { field: "Description", defaultValue: config.description });
                      if (newDescription === false) return;
                      let res = await request('POST', `/api/${params.meet}/modify`, {
                        body: { description: newDescription }
                      });
                      if (res.ok) {
                        setConfig(wrapConfig(await res.json()));
                        message("Update successfully", { variant: "success" });
                      } else {
                        message("Update failed", { variant: "error" });
                      }
                    }} sx={{ transform: 'translateY(-4px)', float: "left" }}>
                        <EditIcon fontSize="small" sx={{ width: 16, height: 16 }}/>
                      </IconButton>}
                    {config.description}
                  </Typography>
                </AccordionDetails>}
            </Accordion>
            {children}
          </Linear>}
      </main>
    </Context.Provider>
  );
}

