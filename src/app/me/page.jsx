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
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [table, setTable] = useState(null);

  useEffect(() => {
    if (user) (async () => {
      let res = await fetch(`/api/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email
        })
      });
      if (res.ok) {
        res = await res.json();
        if (res.table)
          res.table = parse(res.table);
        setInfo(res);
      } else {
        console.log(await res.text());
        window.alert("Access denied");
      }
    })();
  }, [user, setInfo]);

  const update = useCallback(async (tbl, is_new=true) => {
    setTable(tbl);
    if (!tbl || !is_new) return;
    const time = dump(tbl);
    let res = await fetch(`/api/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email, table: time,
      })
    });
    if (!res.ok) {
      window.alert("Update failed");
    } else {
      res = await res.json();
      if (res.table)
        res.table = parse(res.table);
      setInfo(res);
    }
  }, [setTable, user]);

  if (info === null) return "";
  return (
    <main>
      <Linear style={{ minHeight: 'calc(100vh - 64px)', padding: 20 }}>
        {info &&
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
          </Accordion>}
        {/*<Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
            Default table
          </AccordionSummary>
          <AccordionDetails>
            <EditTimeTable
              defaultTable={info.table || null}
              value={table}
              setValue={update}
            />
          </AccordionDetails>
        </Accordion>*/}
      </Linear>
    </main>
  );
}

