"use client"
import { Fragment, useState, useEffect, useMemo, useCallback } from "react";
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
import LaunchIcon from '@mui/icons-material/Launch';
import Linear from "@/components/Linear";
import TimeTable from "@/components/TimeTable";
import { useAuth } from "@/context/Auth";
import { interpret, pad } from "@/utils";

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
  const router = useRouter();
  const { history } = useAuth();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(new Date().toLocaleDateString('en-CA'));
  const [end, setEnd] = useState(new Date().toLocaleDateString('en-CA'));
  const [time, setTime] = useState([9, 22]);

  async function confirm() {
    console.log(title, start, end, time);
    if (title.length === 0)
      return window.alert("Please fill in the title.");
    let res = await fetch(`/api/create-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time: time.map(e => e * 4),
        date: start.split('-').map(e => parseInt(e)),
        duration: (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1,
        title
      })
    });
    if (!res.ok) return;
    res = await res.json();
    router.push(`/${res.id}`);
  }

  return (
    <main>
      <Linear style={{ minHeight: 'calc(100vh - 64px)', padding: '20px 0', gap: '20px' }}>
        <Stack
          spacing={3}
          direction="row"
          useFlexGap
          flexWrap="wrap"
          sx={{ width: '90%', maxWidth: '400px' }}
          justifyContent="center"
        >
          <TextField
            autoFocus
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <DateRange>
            <TextField
              type="date"
              autoFocus
              variant="outlined"
              value={start}
              onChange={e => setStart(e.target.value)}
            />
            -
            <TextField
              type="date"
              autoFocus
              variant="outlined"
              value={end}
              onChange={e => setEnd(e.target.value)}
            />
          </DateRange>
          <Group>
            <Typography gutterBottom>
              Time:
            </Typography>
            <Slider
              // track="inverted"
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
            disabled={time[0] === time[1] || new Date(end).getTime() < new Date(start).getTime()}
          >Go</Button>
        </Stack>
        <List sx={{ bgcolor: '#ddd', '& > li': { pt: 0, pb: 0 }, mt: 4, mx: 1, pt: 0, pb: 0, borderRadius: 1.5 }}>
          <ListItem>
            <Typography variant="h6" sx={{ my: 1 }}>Recently accessed</Typography>
          </ListItem>
          {history.map(({ id, title, date, time, duration }) => {
            const t1 = interpret(date, time[0]);
            const t2 = interpret(date, time[1], [0, duration]);
            return (
              <Fragment key={id}>
                <Divider component="li" />
                <ListItem secondaryAction={
                  <IconButton edge="end" onClick={() => router.push("/" + id)}>
                    <LaunchIcon />
                  </IconButton>
                } sx={{ maxWidth: 'calc(100vw - 20px)', overflow: 'hidden' }}>
                  <ListItemText sx={{ my: 0.5 }} primary={title} secondary={
                    `[${t1[0]}/${t1[1]}/${t1[2]} ${t1[3]} ~ ${t2[0]}/${t2[1]}/${t2[2]} ${t2[3]}] [${pad(t1[4], 2)}:${pad(t1[5], 2)} ~ ${pad(t2[4], 2)}:${pad(t2[5], 2)}]`
                  }/>
                </ListItem>
              </Fragment>
            );
          })}
        </List>
      </Linear>
    </main>
  );
}

