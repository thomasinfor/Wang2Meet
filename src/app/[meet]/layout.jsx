"use client"
import React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from 'next/navigation'
import styled from "@emotion/styled";
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import Linear from "@/components/Linear";
import { parse } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";

const SwitchButton = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  opacity: 0.8;
  z-index: 10;
`;

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

  return (
    <Context.Provider value={{ config, setConfig }}>
      <main>
        {config &&
          <Linear style={{ minHeight: 'calc(100vh - 56px)', gap: '10px', padding: '15px 0' }}>
            <SwitchButton>
              {[
                ["edit", "Editing", EditIcon],
                ["view", "Viewing", VisibilityIcon],
                ["control", "Control", SettingsIcon]
              ].map(([id, label, Icon], i, arr) =>
                <Chip
                  sx={{ display: id !== tab ? 'none' : undefined, fontWeight: 'bold' }}
                  key={id}
                  icon={<Icon/>}
                  label={label}
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/${config.id}/${arr[(i+1)%arr.length][0]}`)}
                />)}
            </SwitchButton>
            {children}
          </Linear>}
      </main>
    </Context.Provider>
  );
}

