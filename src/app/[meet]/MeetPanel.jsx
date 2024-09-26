"use client"
import React from "react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation'
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Linear from "@/components/Linear";
import { parse } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";

const modes = [
  ["edit", "Edit", EditIcon],
  ["view", "View", VisibilityIcon],
  ["control", "Control", SettingsIcon],
];

const Context = createContext(false);
export function useConfig() { return useContext(Context); }

export default function MeetPanel({ params, children }) {
  const { request, addHistory, delHistory, user } = useAuth();
  const { message } = useStatus();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const isAdmin = config?.creator?.email && (config?.creator?.email === user?.email);

  useEffect(() => {
    (async () => {
      let res = await request('GET', `/api/${params.meet}`);
      if (res.ok) {
        res = await res.json();
        for (let i in res.collection)
          res.collection[i].table = parse(res.collection[i].table);
        setConfig(res);
      } else {
        message("Event not found", { variant: "error" });
        if (res.status === 404)
          delHistory(params.meet);
        router.push("/");
      }
    })();
  }, [params.meet, delHistory, addHistory, request, message, router]);
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
    if (!current) return <InsertEmoticonIcon/>;
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
    <Context.Provider value={{ config, setConfig }}>
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
                <Typography variant="h5" sx={{
                  overflow: "hidden",
                  width: "100%",
                  padding: "0 10px",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}>
                  {isAdmin &&
                    <IconButton color="primary" onClick={async event => {
                      if (!isAdmin) return;
                      event.stopPropagation();
                      const newTitle = window.prompt(`Original title:\n"${config.title}"\nNew title: (leave empty to cancel change)`);
                      if (!newTitle) return;
                      if (window.confirm(`Changing the title from:\n"${config.title}"\nto:\n"${newTitle}"`)) {
                        let res = await request('POST', `/api/${params.meet}/modify`, {
                          body: { title: newTitle }
                        });
                        if (res.ok) {
                          setConfig(await res.json());
                          message("Update successfully", { variant: "success" });
                        } else {
                          message("Update failed", { variant: "error" });
                        }
                      }
                    }} sx={{ transform: 'translateY(-3px)' }}>
                      <EditIcon fontSize="small"/>
                    </IconButton>}
                  {config.title}
                </Typography>
              </AccordionSummary>
              {config.description &&
                <AccordionDetails sx={{ whiteSpace: "pre-line", display: "flex", justifyContent: "center" }}>
                  <div>
                    {isAdmin &&
                      <IconButton color="primary" onClick={async event => {
                      if (!isAdmin) return;
                      event.stopPropagation();
                      const newDescription = window.prompt(`Original description:\n"${config.description}"\nNew description: (leave empty to cancel change)`);
                      if (!newDescription) return;
                      if (window.confirm(`Changing the description from:\n"${config.description}"\nto:\n"${newDescription}"`)) {
                        let res = await request('POST', `/api/${params.meet}/modify`, {
                          body: { description: newDescription }
                        });
                        if (res.ok) {
                          setConfig(await res.json());
                          message("Update successfully", { variant: "success" });
                        } else {
                          message("Update failed", { variant: "error" });
                        }
                      }
                    }} sx={{ transform: 'translateY(-2px)' }}>
                        <EditIcon fontSize="small" sx={{ width: 16, height: 16 }}/>
                      </IconButton>}
                    {config.description}
                  </div>
                </AccordionDetails>}
            </Accordion>
            {children}
          </Linear>}
      </main>
    </Context.Provider>
  );
}

