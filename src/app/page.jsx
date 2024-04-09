"use client"
import React from "react";
import { Fragment, useState, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import Linear from "@/components/Linear";
import { useAuth } from "@/context/Auth";
import { interpret } from "@/utils";
import { useStatus } from "@/context/Status";

const Group = styled.div`
  width: 100%;
`;
const DateRange = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export default function Home() {
  const { message } = useStatus();
  const router = useRouter();
  const { history, request } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(new Date().toLocaleDateString('en-CA'));
  const [end, setEnd] = useState(new Date().toLocaleDateString('en-CA'));
  const [time, setTime] = useState([9, 22]);
  const duration = useMemo(() => (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1, [start, end]);

  async function confirm() {
    console.log(title, start, end, time);
    let res = await request('POST', `/api/create-event`, {
      body: {
        time: time.map(e => e * 4),
        date: start.split('-').map(e => parseInt(e)),
        duration,
        title,
        description: description || undefined
      }
    });
    if (!res.ok) return;
    res = await res.json();
    message("Event created", { variant: "success" });
    router.push(`/${res.id}`);
  }

  const [tab, setTab] = useState("create_new");
  const accordionControl = useCallback(id => ({
    expanded: tab === id,
    onChange: (_, newExpanded) => setTab(newExpanded ? id : false)
  }), [tab, setTab]);

  return (
    <main>
      <Linear style={{ minHeight: 'calc(100vh - 56px)', padding: '20px 0', gap: '20px', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '90%' }}>
          <Accordion {...accordionControl("create_new")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
              Create new event
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', justifyContent: 'center' }}>
              <Stack
                spacing={3}
                direction="row"
                useFlexGap
                flexWrap="wrap"
                sx={{ width: '100%', maxWidth: '400px' }}
                justifyContent="center"
              >
                <TextField
                  required
                  size="small"
                  autoComplete="off"
                  fullWidth
                  label="Title"
                  variant="outlined"
                  value={title}
                  error={!title}
                  onChange={e => setTitle(e.target.value)}
                />
                <TextField
                  multiline
                  size="small"
                  autoComplete="off"
                  fullWidth
                  label="Description"
                  variant="outlined"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <DateRange>
                  <TextField
                    error={new Date(end).getTime() < new Date(start).getTime() || isNaN(new Date(start)) || duration > 35}
                    size="small"
                    autoComplete="off"
                    type="date"
                    variant="outlined"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                  />
                  -
                  <TextField
                    error={new Date(end).getTime() < new Date(start).getTime() || isNaN(new Date(end)) || duration > 35}
                    size="small"
                    autoComplete="off"
                    type="date"
                    variant="outlined"
                    value={end}
                    helperText={duration > 35 && "Maximum 35 days"}
                    sx={{ '& .MuiFormHelperText-root': { mt: 0, height: 0 } }}
                    onChange={e => setEnd(e.target.value)}
                  />
                </DateRange>
                <Group>
                  <Typography gutterBottom>
                    Time:
                  </Typography>
                  <Slider
                    // track="inverted"
                    color={time[0] === time[1] ? "error" : "primary"}
                    value={time}
                    getAriaValueText={v => `${v}.`}
                    valueLabelDisplay="auto"
                    step={1}
                    marks={[0,2,4,6,8,10,12,14,16,18,20,22,24].map(e => ({ value: e, label: `${e}.` }))}
                    min={0}
                    max={24}
                    onChange={(e, v) => setTime(v)}
                  />
                </Group>
                <Button
                  variant="contained"
                  onClick={confirm}
                  disabled={[
                    time[0] === time[1],
                    new Date(end).getTime() < new Date(start).getTime(),
                    isNaN(new Date(start)), isNaN(new Date(end)),
                    duration > 35,
                    !title
                  ].some(e => e)}
                >Go</Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
          <Accordion {...accordionControl("recently_accessed")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
              Recently accessed
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ bgcolor: '#ddd', '& > li': { pt: 0, pb: 0 }, pt: 0, pb: 0, borderRadius: 1.5 }}>
                {history.map(({ id, title, date, time, duration }) => {
                  const t1 = interpret(date, time[0]);
                  const t2 = interpret(date, time[1], [0, duration-1]);
                  return (
                    <Fragment key={id}>
                      <Divider component="li" />
                      <ListItem secondaryAction={
                        <IconButton edge="end" onClick={() => router.push("/" + id)}>
                          <NavigateNextIcon color="primary"/>
                        </IconButton>
                      } sx={{ maxWidth: 'calc(100vw - 20px)', overflow: 'hidden' }}>
                        <ListItemText sx={{ my: 0.5, '& .MuiListItemText-secondary': {
                          fontFamily: 'consolas', opacity: 0.8
                        } }} primary={title} secondary={
                          `[${t1.monthPad}/${t1.datePad} ~ ${t2.monthPad}/${t2.datePad}] [${t1.hourPad} ~ ${t2.hourPad}] ${duration} days`
                        }/>
                      </ListItem>
                    </Fragment>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        </div>
        <Stack
          direction="row"
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem/>}
          spacing={2}
        >
          <Link href="https://links.wang.works/w2m-guideline" target="_blank">
            <IconButton color="primary" size="small">
              <HelpIcon/>
            </IconButton>
          </Link>
          <Link href="https://github.com/thomasinfor/Wang2Meet/" target="_blank">
            <IconButton color="primary" size="small">
              <GitHubIcon/>
            </IconButton>
          </Link>
          <Link href="https://links.wang.works/w2m-feedback" target="_blank">
            <Button startIcon={<ReportProblemIcon/>} sx={{ textTransform: 'none' }} size="small">
              Report an issue
            </Button>
          </Link>
        </Stack>
      </Linear>
    </main>
  );
}

