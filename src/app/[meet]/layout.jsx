"use client"
import { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from "react";
import { useRouter, usePathname } from 'next/navigation'
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
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Linear from "@/components/Linear";
import EditTimeTable from "@/components/EditTimeTable";
import ViewTimeTable from "@/components/ViewTimeTable";
import { dump, parse, interpret, pad, defaultTime, defaultDate, tableMap, cast } from "@/utils";
import { useAuth } from "@/context/Auth";
import { useStatus } from "@/context/Status";

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

const Context = createContext(false);
export function useConfig() { return useContext(Context); }

export default function Meet({ params, children }) {
  const { user, request, addHistory, delHistory, signIn } = useAuth();
  const { message } = useStatus();
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
        message("Event not found", { variant: "error" });
        if (res.status === 404)
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

