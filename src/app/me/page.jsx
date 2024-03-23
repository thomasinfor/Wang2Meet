"use client"
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LogoutIcon from '@mui/icons-material/Logout';
import Linear from "@/components/Linear";
import EditTimeTable from "@/components/EditTimeTable";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { dump, parse } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";

export default function MySchedule() {
  const router = useRouter();
  const { message } = useStatus();
  const { user, request, updateUser, logOut } = useAuth();
  const [info, setInfo] = useState(null);
  const [table, setTable] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) (async () => {
      let res = await request('GET', `/api/me`);
      if (res.ok) {
        res = await res.json();
        if (res.table)
          res.table = parse(res.table);
        setInfo(res);
        setName(res.name);
      } else {
        console.log(await res.text());
        window.alert("Access denied");
      }
    })();
  }, [user, setInfo, request]);

  const update = useCallback(async (tbl) => {
    setTable(tbl);
  }, [setTable]);

  const sync = useCallback(async () => {
    const time = dump(table);
    let res = await request('POST', `/api/me`, {
      body: { table: time }
    });
    if (!res.ok) {
      window.alert("Update failed");
      return false;
    } else {
      res = await res.json();
      setInfo(info => {
        res.table = info.table;
        return res;
      });
      return true;
    }
  }, [request, table, setInfo]);

  if (info === null) return "";
  return (
    <main>
      <Linear style={{ minHeight: 'calc(100vh - 56px)', padding: 20, gap: 30 }}>
        {info &&
          <div>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                Display name
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    autoComplete="off"
                    fullWidth
                    label="New name"
                    variant="outlined"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        await updateUser({
                          displayName: name.trim()
                        });
                      } catch(e) {
                        console.error(e);
                        window.alert("Update failed");
                      }
                    }}
                    disabled={name.length === 0}
                  >Update</Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                Default schedule
              </AccordionSummary>
              <AccordionDetails>
                <EditTimeTable
                  defaultTable={info.table || null}
                  value={table}
                  setValue={update}
                  hideDate
                  bufferTime={1}
                  alarm={sync}
                />
              </AccordionDetails>
            </Accordion>
          </div>}
        <Chip
          icon={<LogoutIcon/>}
          label="Log out"
          variant="contained"
          color="primary"
          onClick={() => {
            if (window.confirm("Confirm to log out?")) {
              logOut();
              message("Logged out", { variant: "success" });
              router.push("/");
            }
          }}
        />
      </Linear>
    </main>
  );
}

