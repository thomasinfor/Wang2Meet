"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
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
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Linear from "@/components/Linear";
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { dump, parse, interpret, pad } from "@/utils";
import { useAuth } from "@/context/Auth";

export default function MySchedule({ params }) {
  const { user, request, updateUser } = useAuth();
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

  const update = useCallback(async (tbl, is_new=true) => {
    setTable(tbl);
    if (!tbl || !is_new) return;
    const time = dump(tbl);
    let res = await request('POST', `/api/me`, {
      body: { table: time }
    });
    if (!res.ok) {
      window.alert("Update failed");
    } else {
      res = await res.json();
      if (res.table)
        res.table = parse(res.table);
      setInfo(res);
    }
  }, [setTable, user, request]);

  if (info === null) return "";
  return (
    <main>
      <Linear style={{ minHeight: 'calc(100vh - 64px)', padding: 20 }}>
        {info &&
          <div>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                Name
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
                />
              </AccordionDetails>
            </Accordion>
          </div>}
      </Linear>
    </main>
  );
}

