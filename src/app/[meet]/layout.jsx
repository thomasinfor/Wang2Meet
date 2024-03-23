"use client"
import React from "react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation'
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
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

export default function Meet({ params, children }) {
  const { request, addHistory, delHistory } = useAuth();
  const { message } = useStatus();
  const router = useRouter();
  const [config, setConfig] = useState(null);

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
          <Linear style={{ minHeight: 'calc(100vh - 56px)', gap: '10px', padding: '15px 0' }}>
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
            {children}
          </Linear>}
      </main>
    </Context.Provider>
  );
}

